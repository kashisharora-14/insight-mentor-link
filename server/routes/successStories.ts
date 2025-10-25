
import { Router } from 'express';
import { db } from '../db';
import { successStories, users } from '@shared/schema';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Get all success stories (public - no auth required)
router.get('/', async (req, res) => {
  try {
    const stories = await db
      .select({
        id: successStories.id,
        name: successStories.name,
        batch: successStories.batch,
        program: successStories.program,
        achievement: successStories.achievement,
        description: successStories.description,
        currentPosition: successStories.currentPosition,
        company: successStories.company,
        imageUrl: successStories.imageUrl,
        createdAt: successStories.createdAt,
      })
      .from(successStories)
      .orderBy(desc(successStories.createdAt));

    res.json(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    res.status(500).json({ error: 'Failed to fetch success stories' });
  }
});

// Create a new success story (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, batch, program, achievement, description, currentPosition, company, imageUrl } = req.body;
    const adminId = (req as any).user!.userId;

    if (!name || !batch || !program || !achievement || !description || !currentPosition || !company) {
      return res.status(400).json({ error: 'All fields except image are required' });
    }

    const [story] = await db.insert(successStories).values({
      name,
      batch,
      program,
      achievement,
      description,
      currentPosition,
      company,
      imageUrl: imageUrl || null,
      createdBy: adminId,
    }).returning();

    res.status(201).json(story);
  } catch (error) {
    console.error('Error creating success story:', error);
    res.status(500).json({ error: 'Failed to create success story' });
  }
});

// Update a success story (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, batch, program, achievement, description, currentPosition, company, imageUrl } = req.body;

    const [updated] = await db
      .update(successStories)
      .set({
        name,
        batch,
        program,
        achievement,
        description,
        currentPosition,
        company,
        imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(successStories.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Success story not found' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error updating success story:', error);
    res.status(500).json({ error: 'Failed to update success story' });
  }
});

// Delete a success story (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(successStories).where(eq(successStories.id, id));

    res.json({ message: 'Success story deleted' });
  } catch (error) {
    console.error('Error deleting success story:', error);
    res.status(500).json({ error: 'Failed to delete success story' });
  }
});

export default router;
