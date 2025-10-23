
import { Router } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { mentorshipRequests, messages } from '../../shared/schema';
import { desc, eq } from 'drizzle-orm';

const router = Router();
router.use(authMiddleware);

// Get messages for a mentorship request
router.get('/:mentorshipRequestId/messages', async (req, res) => {
  try {
    const { mentorshipRequestId } = req.params;
    const userId = (req as any).user!.userId;

    const [request] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, mentorshipRequestId))
      .limit(1);

    if (!request) return res.status(404).json({ error: 'Mentorship request not found' });
    if (request.studentId !== userId && request.mentorId !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const data = await db
      .select()
      .from(messages)
      .where(eq(messages.mentorshipRequestId, mentorshipRequestId))
      .orderBy(desc(messages.createdAt));

    res.json({
      messages: data.reverse(),
      status: request.status,
      chatClosedReason: (request as any).chatClosedReason,
      chatClosedAt: (request as any).chatClosedAt,
    });
  } catch (err) {
    console.error('Fetch messages failed', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message (only after acceptance and not blocked)
router.post('/send', async (req, res) => {
  try {
    const { mentorshipRequestId, text } = req.body as { mentorshipRequestId: string; text: string };
    const userId = (req as any).user!.userId;

    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text required' });

    const [request] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, mentorshipRequestId))
      .limit(1);

    if (!request) return res.status(404).json({ error: 'Mentorship request not found' });
    if (request.studentId !== userId && request.mentorId !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }
    if (request.status !== 'accepted') {
      return res.status(403).json({ error: 'Chat allowed only after request is accepted' });
    }

    const [inserted] = await db.insert(messages).values({
      mentorshipRequestId,
      senderId: userId,
      content: text.trim(),
    }).returning();

    res.json({ message: inserted });
  } catch (err) {
    console.error('Send message failed', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Block/unblock removed: simple chat flow only

export default router;
