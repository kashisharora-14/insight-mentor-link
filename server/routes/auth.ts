import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, verificationCodes, approvedUsers, verificationRequests } from '@shared/schema';
import { sendVerificationEmail, sendWelcomeEmail } from '../services/email';
import { eq, and, or, gt } from 'drizzle-orm';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Temporary in-memory storage for demo codes
const demoLoginCodes = new Map<string, { code: string; userId: string; email: string; expiresAt: number }>();

// Passwordless login: Send code
router.post('/login', async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ 
        error: { message: 'Email or student ID is required' }
      });
    }

    // Determine if identifier is email or student ID
    const isEmail = identifier.includes('@');
    let email: string;
    let userId: string;

    if (isEmail) {
      email = identifier;
      // Check if user exists with this email
      const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userRecord.length > 0) {
        userId = userRecord[0].id;
      } else {
        userId = 'temp_' + Date.now();
      }
    } else {
      // Look up user by student ID
      const userRecord = await db.select().from(users).where(eq(users.studentId, identifier)).limit(1);
      if (userRecord.length > 0) {
        email = userRecord[0].email;
        userId = userRecord[0].id;
      } else {
        return res.status(404).json({
          error: { message: 'Student ID not found. Please use your email address or contact admin.' }
        });
      }
    }

    // Generate code
    const code = generateCode();

    // Store code (expires in 5 minutes)
    demoLoginCodes.set(email, {
      code,
      userId,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    console.log(`Login code for ${email}: ${code}`);

    // Send email with the code
    try {
      await sendVerificationEmail(email, code, 'login');
      console.log(`✅ Email sent successfully to ${email}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Still return success but log the error
      // In production, you might want to return an error here
    }

    res.json({
      data: {
        user_id: userId,
        email: email,
        code_expires_in: 300
      }
    });
  } catch (error: any) {
    console.error('Error sending login code:', error);
    res.status(500).json({ 
      error: { message: error.message || 'Failed to send login code' }
    });
  }
});

// Passwordless login: Verify code
router.post('/verify-login-code', async (req, res) => {
  try {
    const { user_id, code } = req.body;

    if (!user_id || !code) {
      return res.status(400).json({
        error: { message: 'User ID and code are required' }
      });
    }

    // Find the code in our demo storage
    let validCode = null;
    for (const [email, data] of demoLoginCodes.entries()) {
      if (data.userId === user_id && data.code === code && data.expiresAt > Date.now()) {
        validCode = data;
        demoLoginCodes.delete(email);
        break;
      }
    }

    if (!validCode) {
      return res.status(400).json({
        error: { message: 'Invalid or expired verification code' }
      });
    }

    let userDetails = null;
    let actualUserId = validCode.userId;

    // Check if this is a temporary user ID
    if (validCode.userId.startsWith('temp_')) {
      // Check if user exists by email
      const existingUser = await db.select().from(users).where(eq(users.email, validCode.email)).limit(1);
      
      if (existingUser.length > 0) {
        // User exists, use their actual ID
        userDetails = existingUser[0];
        actualUserId = userDetails.id;
      } else {
        // Create new user with minimal info
        const newUsers = await db.insert(users).values({
          email: validCode.email,
          passwordHash: '', // No password for passwordless login
          role: 'student',
          isEmailVerified: true,
          isVerified: false,
          verificationMethod: 'pending',
        }).returning();
        
        userDetails = newUsers[0];
        actualUserId = userDetails.id;

        // Create verification request for admin review
        await db.insert(verificationRequests).values({
          userId: actualUserId,
          requestData: { email: validCode.email },
        });
      }
    } else {
      // Get existing user details
      const userRecord = await db.select().from(users).where(eq(users.id, validCode.userId)).limit(1);
      userDetails = userRecord.length > 0 ? userRecord[0] : null;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: actualUserId, email: validCode.email, role: userDetails?.role || 'student' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      data: {
        access_token: token,
        refresh_token: token + '_refresh',
        token_type: 'Bearer',
        expires_in: 604800,
        user: {
          id: actualUserId,
          email: validCode.email,
          name: 'Demo User',
          role: userDetails?.role || 'student',
          isVerified: userDetails?.isVerified || false,
          verificationMethod: userDetails?.verificationMethod || 'pending',
          isEmailVerified: userDetails?.isEmailVerified || true,
        }
      }
    });
  } catch (error) {
    console.error('Error verifying login code:', error);
    res.status(500).json({
      error: { message: 'Failed to verify login code' }
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: { message: 'No token provided' }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Fetch user details for verification status
    const userRecord = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    const userDetails = userRecord.length > 0 ? userRecord[0] : null;

    res.json({
      data: {
        id: decoded.userId,
        email: decoded.email,
        name: 'Demo User',
        role: decoded.role || 'student',
        isVerified: userDetails?.isVerified || false,
        verificationMethod: userDetails?.verificationMethod || 'pending',
        isEmailVerified: userDetails?.isEmailVerified || false,
      }
    });
  } catch (error) {
    res.status(401).json({
      error: { message: 'Invalid token' }
    });
  }
});

// STEP 1: Send verification code (for registration)
router.post('/register/send-code', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate and store verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(verificationCodes).values({
      email,
      code,
      type: 'registration',
      expiresAt,
    });

    // Send email
    await sendVerificationEmail(email, code, 'registration');

    res.json({ 
      message: 'Verification code sent to your email',
      expiresIn: 900 // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// STEP 2: Verify code and complete registration
router.post('/register/verify', async (req, res) => {
  try {
    const { email, code, password, studentId, name, department, graduationYear } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'Email, code, and password are required' });
    }

    // Verify code
    const verificationRecord = await db.select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, 'registration'),
          eq(verificationCodes.isUsed, false),
          gt(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (verificationRecord.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Check if email is in approved list
    const approvedRecord = await db.select()
      .from(approvedUsers)
      .where(
        and(
          or(
            eq(approvedUsers.email, email),
            studentId ? eq(approvedUsers.studentId, studentId) : undefined
          ),
          eq(approvedUsers.isUsed, false)
        )
      )
      .limit(1);

    const isAutoApproved = approvedRecord.length > 0;
    const role = isAutoApproved ? approvedRecord[0].role : (studentId ? 'student' : 'alumni');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      passwordHash,
      role,
      studentId: studentId || null,
      isEmailVerified: true,
      isVerified: isAutoApproved,
      verificationMethod: isAutoApproved ? 'csv_upload' : 'pending',
      verifiedAt: isAutoApproved ? new Date() : null,
    }).returning();

    const userId = newUser[0].id;

    // Mark verification code as used
    await db.update(verificationCodes)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(verificationCodes.id, verificationRecord[0].id));

    // If auto-approved, mark the approved record as used
    if (isAutoApproved) {
      await db.update(approvedUsers)
        .set({ isUsed: true, usedBy: userId, usedAt: new Date() })
        .where(eq(approvedUsers.id, approvedRecord[0].id));
    } else {
      // Create verification request for admin review
      await db.insert(verificationRequests).values({
        userId,
        requestData: { name, department, graduationYear },
      });
    }

    // Send welcome email
    await sendWelcomeEmail(email, name || 'User', isAutoApproved);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, role, isVerified: isAutoApproved },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        role,
        isVerified: isAutoApproved,
        isEmailVerified: true,
      },
    });
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// Password-based login endpoint (alternative login method)
router.post('/login-password', async (req, res) => {
  try {
    const { email, studentId, password } = req.body;

    if (!password || (!email && !studentId)) {
      return res.status(400).json({ error: 'Email/Student ID and password are required' });
    }

    // Find user by email or student ID
    const userRecord = await db.select()
      .from(users)
      .where(
        or(
          email ? eq(users.email, email) : undefined,
          studentId ? eq(users.studentId, studentId) : undefined
        )
      )
      .limit(1);

    if (userRecord.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userRecord[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, isVerified: user.isVerified },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Check if email/student ID is pre-approved
router.post('/check-approval', async (req, res) => {
  try {
    const { email, studentId } = req.body;

    if (!email && !studentId) {
      return res.status(400).json({ error: 'Email or student ID required' });
    }

    const approvedRecord = await db.select()
      .from(approvedUsers)
      .where(
        and(
          or(
            email ? eq(approvedUsers.email, email) : undefined,
            studentId ? eq(approvedUsers.studentId, studentId) : undefined
          ),
          eq(approvedUsers.isUsed, false)
        )
      )
      .limit(1);

    if (approvedRecord.length > 0) {
      return res.json({
        isApproved: true,
        role: approvedRecord[0].role,
        message: 'Your registration will be auto-approved with verified badge',
      });
    }

    res.json({
      isApproved: false,
      message: 'Your registration will require admin approval',
    });
  } catch (error) {
    console.error('Error checking approval:', error);
    res.status(500).json({ error: 'Failed to check approval status' });
  }
});

// Password reset: Send code
router.post('/password-reset/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userRecord.length === 0) {
      // Don't reveal if email exists or not
      return res.json({ message: 'If the email exists, a password reset code has been sent' });
    }

    // Generate and store verification code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(verificationCodes).values({
      email,
      code,
      type: 'password_reset',
      expiresAt,
    });

    await sendVerificationEmail(email, code, 'password_reset');

    res.json({ message: 'If the email exists, a password reset code has been sent' });
  } catch (error) {
    console.error('Error sending password reset code:', error);
    res.status(500).json({ error: 'Failed to send password reset code' });
  }
});

// Password reset: Verify and reset
router.post('/password-reset/verify', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    // Verify code
    const verificationRecord = await db.select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.email, email),
          eq(verificationCodes.code, code),
          eq(verificationCodes.type, 'password_reset'),
          eq(verificationCodes.isUsed, false),
          gt(verificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);

    if (verificationRecord.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email));

    // Mark code as used
    await db.update(verificationCodes)
      .set({ isUsed: true, usedAt: new Date() })
      .where(eq(verificationCodes.id, verificationRecord[0].id));

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  res.status(204).send();
});

export default router;