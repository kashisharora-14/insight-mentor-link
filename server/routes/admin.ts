import { Router } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { db } from '../db';
import { users, verificationRequests, csvUploads, approvedUsers, donations, events, profiles, mentorshipRequests } from '@shared/schema';
import { sendVerificationApprovedEmail } from '../services/email';
import { eq, and } from 'drizzle-orm';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all pending verification requests
router.get('/verification-requests', async (req, res) => {
  try {
    console.log('📋 Admin fetching verification requests...');
    console.log(`   Admin User ID: ${req.user?.userId}`);
    console.log(`   Admin Email: ${req.user?.email}`);

    // First, get all verification requests to debug
    const allRequests = await db.select().from(verificationRequests);
    console.log(`📊 Total verification requests in DB: ${allRequests.length}`);
    
    if (allRequests.length > 0) {
      console.log('📊 All requests breakdown:');
      const statusCounts = allRequests.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }

    const requests = await db.select({
      id: verificationRequests.id,
      userId: verificationRequests.userId,
      status: verificationRequests.status,
      requestData: verificationRequests.requestData,
      createdAt: verificationRequests.createdAt,
      userEmail: users.email,
      userRole: users.role,
      userStudentId: users.studentId,
      userName: users.name,
    })
    .from(verificationRequests)
    .leftJoin(users, eq(verificationRequests.userId, users.id))
    .where(eq(verificationRequests.status, 'pending'))
    .orderBy(verificationRequests.createdAt);

    console.log(`\n📊 VERIFICATION REQUESTS SUMMARY:`);
    console.log(`   Total in DB: ${allRequests.length}`);
    console.log(`   Pending: ${requests.length}`);
    console.log(`   Approved: ${allRequests.filter(r => r.status === 'approved').length}`);
    console.log(`   Rejected: ${allRequests.filter(r => r.status === 'rejected').length}`);
    
    if (requests.length > 0) {
      console.log('\n📋 PENDING VERIFICATION REQUESTS:');
      requests.forEach((r, i) => {
        console.log(`\n   ${i + 1}. ${r.userName || 'Unknown'} (${r.userEmail})`);
        console.log(`      - Request ID: ${r.id}`);
        console.log(`      - User ID: ${r.userId}`);
        console.log(`      - Student ID: ${r.userStudentId || 'N/A'}`);
        console.log(`      - Role: ${r.userRole}`);
        console.log(`      - Created: ${r.createdAt}`);
        console.log(`      - Request Data: ${JSON.stringify(r.requestData)}`);
      });
    } else {
      console.log('\n⚠️ No pending verification requests found');
      if (allRequests.length > 0) {
        console.log('   But there are processed requests in the system.');
      }
    }
    console.log('\n');

    res.json(requests);
  } catch (error) {
    console.error('❌ Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// Approve verification request
router.post('/verification-requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.userId;

    // Get the request
    const request = await db.select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, id))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    if (request[0].status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    const userId = request[0].userId;

    // Update verification request
    await db.update(verificationRequests)
      .set({
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(verificationRequests.id, id));

    // Update user
    await db.update(users)
      .set({
        isVerified: true,
        verificationMethod: 'admin_manual',
        verifiedBy: adminId,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Get user details to send email
    const userRecord = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    let emailSent = false;
    let emailError = null;

    if (userRecord.length > 0) {
      const user = userRecord[0];
      const name = (request[0].requestData as any)?.name || user.name || 'User';

      try {
        console.log(`📧 Sending verification approval email to ${user.email}...`);
        await sendVerificationApprovedEmail(user.email, name);
        console.log(`✅ Verification approval email sent successfully to ${user.email}`);
        emailSent = true;
      } catch (error: any) {
        console.error('❌ Failed to send verification approval email:', error);
        console.error('   Email error details:', {
          message: error.message,
          code: error.code,
          email: user.email
        });
        emailError = error.message;
        // Continue anyway - user is verified even if email fails
      }
    }

    res.json({ 
      message: 'Verification request approved',
      emailSent,
      emailError: emailError || undefined,
      userEmail: userRecord[0]?.email
    });
  } catch (error) {
    console.error('Error approving verification request:', error);
    res.status(500).json({ error: 'Failed to approve verification request' });
  }
});

// Reject verification request
router.post('/verification-requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user!.userId;

    await db.update(verificationRequests)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewNotes: notes,
        reviewedAt: new Date(),
      })
      .where(eq(verificationRequests.id, id));

    res.json({ message: 'Verification request rejected' });
  } catch (error) {
    console.error('Error rejecting verification request:', error);
    res.status(500).json({ error: 'Failed to reject verification request' });
  }
});

// Upload CSV for bulk approval
router.post('/csv-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const adminId = req.user!.userId;
    const fileName = req.file.originalname;

    const results: any[] = [];
    const errors: any[] = [];

    // Parse CSV
    const stream = Readable.from(req.file.buffer);
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Create CSV upload record
          const uploadRecord = await db.insert(csvUploads).values({
            uploadedBy: adminId,
            fileName,
            recordsCount: results.length,
            status: 'processing',
          }).returning();

          const uploadId = uploadRecord[0].id;

          let processedCount = 0;
          let errorCount = 0;

          // Process each row
          for (const row of results) {
            try {
              const email = row.email?.trim().toLowerCase();
              const studentId = row.student_id?.trim() || row.studentId?.trim();
              const role = row.role?.trim().toLowerCase();
              const name = row.name?.trim();
              const department = row.department?.trim();
              const graduationYear = row.graduation_year || row.graduationYear;

              if (!email && !studentId) {
                throw new Error('Email or student ID required');
              }

              if (!role || !['student', 'alumni'].includes(role)) {
                throw new Error('Valid role required (student/alumni)');
              }

              // Check if already exists
              const existing = await db.select()
                .from(approvedUsers)
                .where(
                  and(
                    email ? eq(approvedUsers.email, email) : undefined,
                    studentId ? eq(approvedUsers.studentId, studentId) : undefined
                  )
                )
                .limit(1);

              if (existing.length === 0) {
                await db.insert(approvedUsers).values({
                  email: email || null,
                  studentId: studentId || null,
                  role,
                  name: name || null,
                  department: department || null,
                  graduationYear: graduationYear ? parseInt(graduationYear) : null,
                  csvUploadId: uploadId,
                });
                processedCount++;
              } else {
                processedCount++; // Already exists, count as processed
              }
            } catch (error: any) {
              errorCount++;
              errors.push({
                row,
                error: error.message,
              });
            }
          }

          // Update upload record
          await db.update(csvUploads)
            .set({
              processedCount,
              errorCount,
              status: errorCount === results.length ? 'failed' : 'completed',
              errorLog: errors.length > 0 ? errors : null,
            })
            .where(eq(csvUploads.id, uploadId));

          res.json({
            message: 'CSV processed',
            total: results.length,
            processed: processedCount,
            errors: errorCount,
            errorDetails: errors.length > 0 ? errors.slice(0, 10) : [], // Return first 10 errors
          });
        } catch (error) {
          console.error('Error processing CSV:', error);
          res.status(500).json({ error: 'Failed to process CSV' });
        }
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Failed to parse CSV file' });
      });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

// Get CSV upload history
router.get('/csv-uploads', async (req, res) => {
  try {
    const uploads = await db.select()
      .from(csvUploads)
      .orderBy(csvUploads.createdAt);

    res.json(uploads);
  } catch (error) {
    console.error('Error fetching CSV uploads:', error);
    res.status(500).json({ error: 'Failed to fetch CSV uploads' });
  }
});

// Unverify a user
router.post('/users/:userId/unverify', async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user!.userId;

    // Update user verification status
    await db.update(users)
      .set({
        isVerified: false,
        verificationMethod: null,
        verifiedBy: null,
        verifiedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Also update any associated verification requests to rejected
    await db.update(verificationRequests)
      .set({
        status: 'rejected',
        reviewedBy: adminId,
        reviewNotes: 'Verification revoked by admin',
        reviewedAt: new Date(),
      })
      .where(and(
        eq(verificationRequests.userId, userId),
        eq(verificationRequests.status, 'approved')
      ));

    res.json({ message: 'User unverified successfully' });
  } catch (error) {
    console.error('Error unverifying user:', error);
    res.status(500).json({ error: 'Failed to unverify user' });
  }
});

// Get all users with verification status
router.get('/users', async (req, res) => {
  try {
    const { role, verified } = req.query;

    let query = db.select().from(users);

    // Apply filters if provided
    const conditions = [];
    if (role) {
      conditions.push(eq(users.role, role as string));
    }
    if (verified !== undefined) {
      conditions.push(eq(users.isVerified, verified === 'true'));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const allUsers = await query.orderBy(users.createdAt);

    console.log('📊 Database users verification status:', allUsers.map(u => ({
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      verificationMethod: u.verificationMethod
    })));

    // Remove password hashes from response and ensure correct field names
    const sanitizedUsers = allUsers.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        // Ensure camelCase for frontend
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        verificationMethod: user.verificationMethod,
        verifiedBy: user.verifiedBy,
        verifiedAt: user.verifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        studentId: user.studentId,
        graduationYear: null, // Add from profile if needed
        currentJob: null, // Add from profile if needed
        company: null, // Add from profile if needed
        isMentorAvailable: false // Add from profile if needed
      };
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all donations
router.get('/donations', async (req, res) => {
  try {
    const allDonations = await db.select().from(donations).orderBy(donations.createdAt);
    res.json(allDonations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const allEvents = await db.select().from(events).orderBy(events.createdAt);
    res.json(allEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get all profiles (extended user info)
router.get('/profiles', async (req, res) => {
  try {
    const allProfiles = await db.select().from(profiles).orderBy(profiles.createdAt);
    res.json(allProfiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Get all mentorship requests
router.get('/mentorship-requests', async (req, res) => {
  try {
    const requests = await db.select().from(mentorshipRequests).orderBy(mentorshipRequests.createdAt);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship requests' });
  }
});

export default router;