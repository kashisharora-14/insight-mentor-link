
import { Router } from 'express';
import { db } from '../db';
import { jobs, jobReferralRequests, users, profiles } from '../../shared/schema';
import { authMiddleware, AuthRequest, adminMiddleware } from '../middleware/auth';
import { eq, and, desc, or, sql } from 'drizzle-orm';

const router = Router();

// Get all jobs (students see approved, alumni/admin see all their own + approved)
router.get('/', async (req, res) => {
  try {
    const userRole = (req as AuthRequest).user?.role;
    const userId = (req as AuthRequest).user?.userId;

    let jobsList;

    if (userRole === 'admin') {
      // Admins see all jobs
      jobsList = await db
        .select({
          job: jobs,
          postedByName: users.name,
          postedByEmail: users.email,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.postedBy, users.id))
        .orderBy(desc(jobs.createdAt));
    } else if (userRole === 'alumni' && userId) {
      // Alumni see their own jobs (all statuses) + approved jobs from others
      jobsList = await db
        .select({
          job: jobs,
          postedByName: users.name,
          postedByEmail: users.email,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.postedBy, users.id))
        .where(
          or(
            eq(jobs.postedBy, userId),
            eq(jobs.status, 'approved')
          )
        )
        .orderBy(desc(jobs.createdAt));
    } else {
      // Students see only approved jobs
      jobsList = await db
        .select({
          job: jobs,
          postedByName: users.name,
          postedByEmail: users.email,
        })
        .from(jobs)
        .leftJoin(users, eq(jobs.postedBy, users.id))
        .where(eq(jobs.status, 'approved'))
        .orderBy(desc(jobs.createdAt));
    }

    const formattedJobs = jobsList.map(({ job, postedByName, postedByEmail }) => ({
      ...job,
      postedByName: postedByName || 'Unknown',
      postedByEmail: postedByEmail || '',
    }));

    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create new job
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = (req as AuthRequest).user!;
    
    if (user.role !== 'alumni' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Only alumni and admins can post jobs' });
    }

    const {
      title,
      description,
      company,
      companyLogo,
      location,
      jobType,
      salaryRange,
      requirements,
      applicationLink,
      referralAvailable,
      experienceRequired,
      skills,
      expiresAt,
    } = req.body;

    if (!title || !description || !company) {
      return res.status(400).json({ error: 'Title, description, and company are required' });
    }

    // Admin posts are auto-approved, alumni posts need approval
    const status = user.role === 'admin' ? 'approved' : 'pending';

    const [newJob] = await db.insert(jobs).values({
      title,
      description,
      company,
      companyLogo: companyLogo || null,
      location: location || null,
      jobType: jobType || null,
      salaryRange: salaryRange || null,
      requirements: requirements || null,
      postedBy: user.userId,
      postedByRole: user.role,
      applicationLink: applicationLink || null,
      referralAvailable: referralAvailable || false,
      experienceRequired: experienceRequired || null,
      skills: skills || null,
      status,
      approvedBy: user.role === 'admin' ? user.userId : null,
      approvedAt: user.role === 'admin' ? new Date() : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    res.status(201).json({
      message: user.role === 'admin' 
        ? 'Job posted successfully' 
        : 'Job submitted for approval',
      job: newJob,
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (only by poster or admin)
router.put('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = (req as AuthRequest).user!;

    const [existingJob] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Only the poster or admin can update
    if (existingJob.postedBy !== user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    
    // If alumni updates their job, reset to pending
    if (user.role === 'alumni' && existingJob.status === 'approved') {
      updateData.status = 'pending';
      updateData.approvedBy = null;
      updateData.approvedAt = null;
    }

    const [updatedJob] = await db
      .update(jobs)
      .set(updateData)
      .where(eq(jobs.id, jobId))
      .returning();

    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:jobId', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = (req as AuthRequest).user!;

    const [existingJob] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (existingJob.postedBy !== user.userId && user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    await db.delete(jobs).where(eq(jobs.id, jobId));

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Approve job (admin only)
router.post('/:jobId/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = (req as AuthRequest).user!;

    const [updatedJob] = await db
      .update(jobs)
      .set({
        status: 'approved',
        approvedBy: user.userId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job approved successfully', job: updatedJob });
  } catch (error) {
    console.error('Error approving job:', error);
    res.status(500).json({ error: 'Failed to approve job' });
  }
});

// Reject job (admin only)
router.post('/:jobId/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const [updatedJob] = await db
      .update(jobs)
      .set({
        status: 'rejected',
        rejectionReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId))
      .returning();

    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job rejected', job: updatedJob });
  } catch (error) {
    console.error('Error rejecting job:', error);
    res.status(500).json({ error: 'Failed to reject job' });
  }
});

// Request referral (students only)
router.post('/:jobId/referral-request', authMiddleware, async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = (req as AuthRequest).user!;
    const { message, resumeUrl } = req.body;

    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request referrals' });
    }

    const [job] = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (!job.referralAvailable) {
      return res.status(400).json({ error: 'Referrals not available for this job' });
    }

    if (job.status !== 'approved') {
      return res.status(400).json({ error: 'Job is not active' });
    }

    // Check if already requested
    const existing = await db
      .select()
      .from(jobReferralRequests)
      .where(
        and(
          eq(jobReferralRequests.jobId, jobId),
          eq(jobReferralRequests.studentId, user.userId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Referral already requested for this job' });
    }

    const [referralRequest] = await db.insert(jobReferralRequests).values({
      jobId,
      studentId: user.userId,
      alumniId: job.postedBy,
      message: message || null,
      resumeUrl: resumeUrl || null,
      status: 'pending',
    }).returning();

    res.status(201).json({
      message: 'Referral request submitted successfully',
      request: referralRequest,
    });
  } catch (error: any) {
    console.error('Error creating referral request:', error);
    if (error?.code === '23505') {
      return res.status(400).json({ error: 'Referral already requested for this job' });
    }
    res.status(500).json({ error: 'Failed to create referral request' });
  }
});

// Get referral requests for alumni
router.get('/referral-requests/my-requests', authMiddleware, async (req, res) => {
  try {
    const user = (req as AuthRequest).user!;

    if (user.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can view referral requests' });
    }

    const requests = await db
      .select({
        request: jobReferralRequests,
        job: jobs,
        studentName: users.name,
        studentEmail: users.email,
        studentProfile: profiles,
      })
      .from(jobReferralRequests)
      .leftJoin(jobs, eq(jobReferralRequests.jobId, jobs.id))
      .leftJoin(users, eq(jobReferralRequests.studentId, users.id))
      .leftJoin(profiles, eq(jobReferralRequests.studentId, profiles.userId))
      .where(eq(jobReferralRequests.alumniId, user.userId))
      .orderBy(desc(jobReferralRequests.createdAt));

    const formattedRequests = requests.map(({ request, job, studentName, studentEmail, studentProfile }) => ({
      ...request,
      jobTitle: job?.title || 'Unknown Job',
      jobCompany: job?.company || '',
      studentName: studentName || 'Unknown',
      studentEmail: studentEmail || '',
      studentProfile: studentProfile ? {
        bio: studentProfile.bio,
        skills: studentProfile.skills,
        department: studentProfile.department,
        graduationYear: studentProfile.graduationYear,
      } : null,
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching referral requests:', error);
    res.status(500).json({ error: 'Failed to fetch referral requests' });
  }
});

// Get student's referral requests
router.get('/referral-requests/my-applications', authMiddleware, async (req, res) => {
  try {
    const user = (req as AuthRequest).user!;

    if (user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their applications' });
    }

    const requests = await db
      .select({
        request: jobReferralRequests,
        job: jobs,
        alumniName: users.name,
        alumniEmail: users.email,
      })
      .from(jobReferralRequests)
      .leftJoin(jobs, eq(jobReferralRequests.jobId, jobs.id))
      .leftJoin(users, eq(jobReferralRequests.alumniId, users.id))
      .where(eq(jobReferralRequests.studentId, user.userId))
      .orderBy(desc(jobReferralRequests.createdAt));

    const formattedRequests = requests.map(({ request, job, alumniName, alumniEmail }) => ({
      ...request,
      jobTitle: job?.title || 'Unknown Job',
      jobCompany: job?.company || '',
      alumniName: alumniName || 'Unknown',
      alumniEmail: alumniEmail || '',
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching referral applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Accept/reject referral request (alumni only)
router.put('/referral-requests/:requestId', authMiddleware, async (req, res) => {
  try {
    const { requestId } = req.params;
    const user = (req as AuthRequest).user!;
    const { status, responseMessage } = req.body;

    if (user.role !== 'alumni') {
      return res.status(403).json({ error: 'Only alumni can respond to referral requests' });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [request] = await db
      .select()
      .from(jobReferralRequests)
      .where(eq(jobReferralRequests.id, requestId))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Referral request not found' });
    }

    if (request.alumniId !== user.userId) {
      return res.status(403).json({ error: 'Not authorized to respond to this request' });
    }

    const [updatedRequest] = await db
      .update(jobReferralRequests)
      .set({
        status,
        responseMessage: responseMessage || null,
        updatedAt: new Date(),
      })
      .where(eq(jobReferralRequests.id, requestId))
      .returning();

    res.json({
      message: `Referral request ${status}`,
      request: updatedRequest,
    });
  } catch (error) {
    console.error('Error updating referral request:', error);
    res.status(500).json({ error: 'Failed to update referral request' });
  }
});

export default router;
