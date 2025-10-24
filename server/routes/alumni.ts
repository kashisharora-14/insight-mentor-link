
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { alumniProfiles } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get alumni profile
router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const profile = await db.query.alumniProfiles.findFirst({
      where: eq(alumniProfiles.userId, userId)
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Create or update alumni profile
router.post('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profileData = req.body;

    // Check if profile exists
    const existingProfile = await db.query.alumniProfiles.findFirst({
      where: eq(alumniProfiles.userId, userId)
    });

    if (existingProfile) {
      // Update existing profile
      const [updated] = await db
        .update(alumniProfiles)
        .set({
          ...profileData,
          updatedAt: new Date()
        })
        .where(eq(alumniProfiles.userId, userId))
        .returning();

      res.json(updated);
    } else {
      // Create new profile
      const [created] = await db
        .insert(alumniProfiles)
        .values({
          userId,
          ...profileData,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      res.json(created);
    }
  } catch (error) {
    console.error('Error saving alumni profile:', error);
    res.status(500).json({ message: 'Failed to save profile' });
  }
});

// Get all alumni profiles (for directory)
router.get('/directory', async (req: Request, res: Response) => {
  try {
    const profiles = await db.query.alumniProfiles.findMany();

    res.json({ alumni: profiles });
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    res.status(500).json({ message: 'Failed to fetch directory' });
  }
});

// Get specific alumni profile by ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await db.query.alumniProfiles.findFirst({
      where: eq(alumniProfiles.id, id)
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching alumni profile:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

export default router;
