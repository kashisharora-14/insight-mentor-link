import { Router } from 'express';
import { db } from '../db';
import { studentProfiles, verificationRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { validateStudentProfile } from '../utils/validation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      console.error('❌ No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    console.log('✅ Token verified for user:', req.user.userId);
    next();
  } catch (error) {
    console.error('❌ Invalid token:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get student profile
router.get('/profile', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const profile = await db.select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      console.log('ℹ️ Profile not found for user:', userId);
      return res.json({ profile: null });
    }

    // Return profile with camelCase field names
    res.json({ 
      profile: {
        ...profile[0],
        rollNumber: profile[0].rollNumber,
        currentSemester: profile[0].currentSemester,
        currentBacklog: profile[0].currentBacklog,
        dateOfBirth: profile[0].dateOfBirth,
        bloodGroup: profile[0].bloodGroup,
        phoneNumber: profile[0].phoneNumber,
        alternateEmail: profile[0].alternateEmail,
        permanentAddress: profile[0].permanentAddress,
        currentAddress: profile[0].currentAddress,
        batchYear: profile[0].batchYear,
        fatherName: profile[0].fatherName,
        fatherOccupation: profile[0].fatherOccupation,
        fatherPhone: profile[0].fatherPhone,
        motherName: profile[0].motherName,
        motherOccupation: profile[0].motherOccupation,
        motherPhone: profile[0].motherPhone,
        guardianName: profile[0].guardianName,
        guardianRelation: profile[0].guardianRelation,
        guardianPhone: profile[0].guardianPhone,
        admissionType: profile[0].admissionType,
        scholarshipStatus: profile[0].scholarshipStatus,
        hostelResident: profile[0].hostelResident,
        hostelRoomNumber: profile[0].hostelRoomNumber,
        transportMode: profile[0].transportMode,
        technicalSkills: profile[0].technicalSkills,
        softSkills: profile[0].softSkills,
        careerGoals: profile[0].careerGoals,
        linkedinUrl: profile[0].linkedinUrl,
        githubUrl: profile[0].githubUrl,
        portfolioUrl: profile[0].portfolioUrl,
      }
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update student profile
router.post('/profile', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    console.log('=== PROFILE SAVE REQUEST ===');
    console.log('User ID:', userId);
    console.log('Received data keys:', Object.keys(data));
    console.log('Received profile data:', JSON.stringify(data, null, 2));

    const validation = validateStudentProfile(data);
    if (!validation.valid) {
      console.error('Validation failed:', validation.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validation.errors 
      });
    }

    // Convert dateOfBirth to Date object if it exists
    // Auto-set department to "Computer Science" for Punjab University
    const profileData: any = {
      department: 'Computer Science', // Always Computer Science for Punjab University CS Dept
      updatedAt: new Date(),
    };

    // Map all fields from request to profileData
    const fieldMapping = [
      'rollNumber', 'program', 'batchType', 'currentYear', 'batchYear', 
      'currentSemester', 'cgpa', 'currentBacklog', 'gender', 'bloodGroup',
      'category', 'nationality', 'religion', 'phoneNumber', 'alternateEmail',
      'permanentAddress', 'currentAddress', 'city', 'state', 'pincode',
      'fatherName', 'fatherOccupation', 'fatherPhone', 'motherName',
      'motherOccupation', 'motherPhone', 'guardianName', 'guardianRelation',
      'guardianPhone', 'admissionType', 'scholarshipStatus', 'hostelResident',
      'hostelRoomNumber', 'transportMode', 'technicalSkills', 'softSkills',
      'interests', 'careerGoals', 'linkedinUrl', 'githubUrl', 'portfolioUrl',
      'profilePictureUrl'
    ];

    fieldMapping.forEach(field => {
      if (data[field] !== undefined) {
        profileData[field] = data[field];
      }
    });

    // Handle date conversion
    if (data.dateOfBirth) {
      try {
        profileData.dateOfBirth = new Date(data.dateOfBirth);
      } catch (e) {
        console.error('Invalid date format for dateOfBirth:', data.dateOfBirth);
      }
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      console.log('Updating existing profile');
      await db.update(studentProfiles)
        .set(profileData)
        .where(eq(studentProfiles.userId, userId));

      const updated = await db.select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, userId))
        .limit(1);

      console.log('✅ Profile updated successfully for user:', userId);
      return res.json({ message: 'Profile updated successfully', profile: updated[0] });
    } else {
      // Create new profile
      console.log('📝 Creating new profile for user:', userId);
      const newProfile = await db.insert(studentProfiles)
        .values({
          userId,
          ...profileData,
        })
        .returning();

      console.log('✅ Profile created successfully for user:', userId);

      // Create verification request automatically after profile creation
      try {
        const existingRequest = await db.select()
          .from(verificationRequests)
          .where(eq(verificationRequests.userId, userId))
          .limit(1);

        if (existingRequest.length === 0) {
          await db.insert(verificationRequests)
            .values({
              userId,
              status: 'pending',
              requestData: {
                type: 'student',
                profileData: {
                  rollNumber: data.rollNumber,
                  program: data.program,
                  batchYear: data.batchYear,
                  currentSemester: data.currentSemester,
                }
              },
            });
          console.log('✅ Verification request created automatically');
        }
      } catch (verifyError) {
        console.error('Warning: Failed to create verification request:', verifyError);
      }

      return res.json({ message: 'Profile created successfully', profile: newProfile[0] });
    }
  } catch (error) {
    console.error('❌ ERROR saving student profile:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: req.user?.userId
    });
    return res.status(500).json({ 
      error: 'Failed to save profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;