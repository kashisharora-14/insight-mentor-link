
import { Router } from 'express';
import { db } from '../db';
import { mentorshipRequests, profiles } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Get mentorship requests for current user (as mentor)
router.get('/my-requests', async (req, res) => {
  try {
    const userId = req.user!.userId;
    
    // Get all requests where user is the mentor
    const requests = await db.select({
      id: mentorshipRequests.id,
      studentId: mentorshipRequests.studentId,
      mentorId: mentorshipRequests.mentorId,
      fieldOfInterest: mentorshipRequests.fieldOfInterest,
      description: mentorshipRequests.description,
      status: mentorshipRequests.status,
      createdAt: mentorshipRequests.createdAt,
    })
    .from(mentorshipRequests)
    .where(eq(mentorshipRequests.mentorId, userId))
    .orderBy(mentorshipRequests.createdAt);
    
    // Transform to match frontend format
    const transformedRequests = requests.map(req => ({
      id: req.id,
      studentName: 'Student Name', // TODO: Join with profiles table
      studentEmail: 'student@example.com',
      studentDepartment: 'UICET',
      studentYear: '2024',
      subject: req.fieldOfInterest,
      goals: req.description || '',
      preferredTime: 'Flexible',
      message: req.description || '',
      status: req.status as 'pending' | 'accepted' | 'declined' | 'completed',
      createdAt: req.createdAt?.toISOString() || new Date().toISOString(),
    }));
    
    res.json(transformedRequests);
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship requests' });
  }
});

// Update mentorship request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!.userId;
    
    // Verify the request belongs to this mentor
    const request = await db.select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, id))
      .limit(1);
    
    if (request.length === 0 || request[0].mentorId !== userId) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    await db.update(mentorshipRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(mentorshipRequests.id, id));
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating mentorship status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
