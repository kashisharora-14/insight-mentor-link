import { Router } from 'express';
import { db } from '../db';
import { alumniProfiles, users, verificationRequests } from '@shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

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

// Get alumni profile
router.get('/profile', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const profile = await db.select()
      .from(alumniProfiles)
      .where(eq(alumniProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      console.log('ℹ️ Alumni profile not found for user:', userId);
      return res.json({ profile: null });
    }

    console.log('✅ Alumni profile found for user:', userId);
    res.json({ profile: profile[0] });
  } catch (error) {
    console.error('❌ Error fetching alumni profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update alumni profile
router.post('/profile', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const data = req.body;

    console.log('=== ALUMNI PROFILE SAVE REQUEST ===');
    console.log('User ID:', userId);
    console.log('Received data keys:', Object.keys(data));

    // Auto-set department to "Computer Science" for Punjab University
    const profileData: any = {
      department: 'Computer Science',
      updatedAt: new Date(),
    };

    // Map all fields from request to profileData
    const fieldMapping = [
      'rollNumber', 'program', 'batchType', 'graduationYear', 'admissionYear',
      'cgpa', 'gender', 'bloodGroup', 'nationality', 'phoneNumber',
      'alternateEmail', 'currentAddress', 'city', 'state', 'country', 'pincode',
      'currentPosition', 'currentCompany', 'companyLocation', 'industry',
      'workType', 'yearsOfExperience', 'technicalSkills',
      'softSkills', 'expertiseAreas', 'certifications', 'achievements',
      'isMentorAvailable', 'mentorshipAreas', 'availableForJobReferrals',
      'availableForGuestLectures', 'availableForNetworking', 'preferredCommunication',
      'maxMentees', 'bio', 'careerJourney', 'adviceForStudents', 'linkedinUrl',
      'githubUrl', 'portfolioUrl', 'twitterUrl', 'personalWebsite',
      'profilePictureUrl', 'isPublicProfile', 'showContactInfo'
    ];

    fieldMapping.forEach(field => {
      if (data[field] !== undefined && data[field] !== '') {
        profileData[field] = data[field];
      }
    });

    // Handle previousCompanies (work experience) specially to ensure it's stored as JSON
    if (data.previousCompanies !== undefined) {
      profileData.previousCompanies = Array.isArray(data.previousCompanies) 
        ? data.previousCompanies 
        : [];
    }

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
      .from(alumniProfiles)
      .where(eq(alumniProfiles.userId, userId))
      .limit(1);

    let savedProfile;
    
    if (existingProfile.length > 0) {
      // Update existing profile
      console.log('Updating existing alumni profile');
      await db.update(alumniProfiles)
        .set(profileData)
        .where(eq(alumniProfiles.userId, userId));

      const updated = await db.select()
        .from(alumniProfiles)
        .where(eq(alumniProfiles.userId, userId))
        .limit(1);

      savedProfile = updated[0];
      console.log('✅ Alumni profile updated successfully');
    } else {
      // Create new profile
      console.log('📝 Creating new alumni profile');
      const newProfile = await db.insert(alumniProfiles)
        .values({
          userId,
          ...profileData,
        })
        .returning();

      savedProfile = newProfile[0];
      console.log('✅ Alumni profile created successfully');

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
                type: 'alumni',
                profileData: {
                  name: data.name || '',
                  program: data.program,
                  graduationYear: data.graduationYear,
                  currentCompany: data.currentCompany,
                  currentPosition: data.currentPosition,
                }
              },
            });
          console.log('✅ Verification request created automatically');
        }
      } catch (verifyError) {
        console.error('Warning: Failed to create verification request:', verifyError);
      }
    }

    return res.json({ 
      message: existingProfile.length > 0 ? 'Profile updated successfully' : 'Profile created successfully',
      profile: savedProfile 
    });
  } catch (error) {
    console.error('❌ ERROR saving alumni profile:', error);
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

// Get all verified alumni profiles (for Alumni Directory)
router.get('/directory', async (req, res) => {
  try {
    console.log('📖 Fetching alumni directory');
    
    // Get all verified alumni with public profiles
    const alumni = await db.select({
      profile: alumniProfiles,
      user: users,
    })
    .from(alumniProfiles)
    .leftJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(users.isVerified, true));

    // Filter only public profiles and format response
    const publicAlumni = alumni
      .filter(a => a.profile.isPublicProfile !== false)
      .map(a => ({
        id: a.profile.id,
        userId: a.profile.userId,
        name: a.user?.name,
        email: a.profile.showContactInfo ? a.user?.email : null,
        phoneNumber: a.profile.showContactInfo ? a.profile.phoneNumber : null,
        program: a.profile.program,
        batchType: a.profile.batchType,
        graduationYear: a.profile.graduationYear,
        currentPosition: a.profile.currentPosition,
        currentCompany: a.profile.currentCompany,
        companyLocation: a.profile.companyLocation,
        industry: a.profile.industry,
        workType: a.profile.workType,
        yearsOfExperience: a.profile.yearsOfExperience,
        technicalSkills: a.profile.technicalSkills,
        expertiseAreas: a.profile.expertiseAreas,
        isMentorAvailable: a.profile.isMentorAvailable,
        mentorshipAreas: a.profile.mentorshipAreas,
        availableForJobReferrals: a.profile.availableForJobReferrals,
        availableForGuestLectures: a.profile.availableForGuestLectures,
        availableForNetworking: a.profile.availableForNetworking,
        bio: a.profile.bio,
        careerJourney: a.profile.careerJourney,
        adviceForStudents: a.profile.adviceForStudents,
        linkedinUrl: a.profile.linkedinUrl,
        githubUrl: a.profile.githubUrl,
        portfolioUrl: a.profile.portfolioUrl,
        profilePictureUrl: a.profile.profilePictureUrl,
        isVerified: a.user?.isVerified,
      }));

    console.log(`✅ Found ${publicAlumni.length} verified public alumni profiles`);
    res.json({ alumni: publicAlumni });
  } catch (error) {
    console.error('❌ Error fetching alumni directory:', error);
    res.status(500).json({ error: 'Failed to fetch alumni directory' });
  }
});

// Get single alumni profile by ID (for viewing detailed profile)
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('📖 Fetching alumni profile for user:', userId);

    const result = await db.select({
      profile: alumniProfiles,
      user: users,
    })
    .from(alumniProfiles)
    .leftJoin(users, eq(alumniProfiles.userId, users.id))
    .where(eq(alumniProfiles.userId, userId))
    .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    const { profile, user } = result[0];

    // Check if profile is public and user is verified
    if (!profile.isPublicProfile || !user?.isVerified) {
      return res.status(403).json({ error: 'Profile is not public or not verified' });
    }

    // Parse work experience if stored as JSON string
    let workExp = profile.previousCompanies;
    if (typeof workExp === 'string') {
      try {
        workExp = JSON.parse(workExp);
      } catch {
        workExp = [];
      }
    }

    const publicProfile = {
      id: profile.id,
      userId: profile.userId,
      name: user.name,
      email: profile.showContactInfo ? user.email : null,
      phoneNumber: profile.showContactInfo ? profile.phoneNumber : null,
      program: profile.program,
      batchType: profile.batchType,
      graduationYear: profile.graduationYear,
      admissionYear: profile.admissionYear,
      currentPosition: profile.currentPosition,
      currentCompany: profile.currentCompany,
      companyLocation: profile.companyLocation,
      industry: profile.industry,
      workType: profile.workType,
      yearsOfExperience: profile.yearsOfExperience,
      previousCompanies: workExp || [],
      technicalSkills: profile.technicalSkills,
      softSkills: profile.softSkills,
      expertiseAreas: profile.expertiseAreas,
      certifications: profile.certifications,
      achievements: profile.achievements,
      isMentorAvailable: profile.isMentorAvailable,
      mentorshipAreas: profile.mentorshipAreas,
      availableForJobReferrals: profile.availableForJobReferrals,
      availableForGuestLectures: profile.availableForGuestLectures,
      availableForNetworking: profile.availableForNetworking,
      preferredCommunication: profile.preferredCommunication,
      maxMentees: profile.maxMentees,
      bio: profile.bio,
      careerJourney: profile.careerJourney,
      adviceForStudents: profile.adviceForStudents,
      linkedinUrl: profile.linkedinUrl,
      githubUrl: profile.githubUrl,
      portfolioUrl: profile.portfolioUrl,
      twitterUrl: profile.twitterUrl,
      personalWebsite: profile.personalWebsite,
      profilePictureUrl: profile.profilePictureUrl,
      isVerified: user.isVerified,
    };

    console.log('✅ Alumni profile found and returned');
    res.json({ profile: publicProfile });
  } catch (error) {
    console.error('❌ Error fetching alumni profile:', error);
    res.status(500).json({ error: 'Failed to fetch alumni profile' });
  }
});

export default router;
