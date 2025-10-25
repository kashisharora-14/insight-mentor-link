import { Router } from 'express';
import { db } from '../db';
import { mentorshipRequests, profiles, users, mentorshipReviews } from '../../shared/schema';
import { and, eq, or, count, avg, sql } from 'drizzle-orm';
import { authMiddleware } from '../middleware/auth';
import { Client } from 'pg';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Student: list my mentorship requests (with mentor info)
router.get('/my-requests-student', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `
        select mr.id,
               mr.student_id as "studentId",
               mr.mentor_id as "mentorId",
               mr.field_of_interest as "fieldOfInterest",
               mr.description,
               mr.goals,
               mr.preferred_time as "preferredTime",
               mr.status,
               mr.created_at as "createdAt",
               p.name as "mentorName",
               p.email as "mentorEmail",
               ap.profile_picture_url as "mentorProfilePicture"
        from mentorship_requests mr
        left join profiles p on p.user_id = mr.mentor_id
        left join alumni_profiles ap on ap.user_id = mr.mentor_id
        where mr.student_id = $1
        order by mr.created_at desc`;
      const { rows } = await client.query(q, [userId]);
      const out = rows.map((r: any) => ({
        id: r.id,
        mentorId: r.mentorid || r.mentorId,
        mentorName: r.mentorname || r.mentorName || 'Mentor',
        mentorEmail: r.mentoremail || r.mentorEmail || '',
        mentorProfilePicture: r.mentorprofilepicture || r.mentorProfilePicture || null,
        subject: r.fieldofinterest || r.fieldOfInterest,
        message: r.description || '',
        goals: r.goals || '',
        preferredTime: r.preferredtime || r.preferredTime || '',
        status: r.status as 'pending' | 'accepted' | 'declined' | 'completed',
        createdAt: (r.createdat ? new Date(r.createdat) : (r.createdAt ? new Date(r.createdAt) : new Date())).toISOString(),
      }));
      res.json(out);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error fetching student mentorship requests:', error);
    res.status(500).json({ error: 'Failed to fetch student requests', detail: (error as any)?.message });
  }
});

// Messages: list messages for a mentorship (participant only)
router.get('/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const { id } = req.params;
    // Check membership
    const [reqRow] = await db.select().from(mentorshipRequests).where(eq(mentorshipRequests.id, id)).limit(1);
    if (!reqRow) return res.status(404).json({ error: 'Mentorship request not found' });
    if (reqRow.studentId !== userId && reqRow.mentorId !== userId) {
      return res.status(403).json({ error: 'Not authorized for this mentorship' });
    }
    const participantRole = reqRow.mentorId === userId ? 'mentor' : 'student';
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `select id, sender_id as "senderId", content, is_read as "isRead", created_at as "createdAt"
                 from messages where mentorship_request_id = $1 order by created_at asc`;
      const { rows } = await client.query(q, [id]);
      const messages = rows.map((m: any) => ({
        id: m.id,
        senderId: m.senderid || m.senderId,
        content: m.content,
        isRead: Boolean(m.isread ?? m.isRead),
        createdAt: (m.createdat ? new Date(m.createdat) : (m.createdAt ? new Date(m.createdAt) : new Date())).toISOString(),
      }));
      res.json({
        messages,
        status: reqRow.status,
        chatClosedReason: (reqRow as any).chatClosedReason || null,
        chatClosedAt: (reqRow as any).chatClosedAt ? new Date((reqRow as any).chatClosedAt as any).toISOString() : null,
        participantRole,
      });
    } finally { await client.end(); }
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', detail: (error as any)?.message });
  }
});

// Messages: send a message (participant only)
router.post('/:id/messages', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const { id } = req.params;
    const { content } = req.body as { content: string };
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content is required' });
    const [reqRow] = await db.select().from(mentorshipRequests).where(eq(mentorshipRequests.id, id)).limit(1);
    if (!reqRow) return res.status(404).json({ error: 'Mentorship request not found' });
    if (reqRow.studentId !== userId && reqRow.mentorId !== userId) {
      return res.status(403).json({ error: 'Not authorized for this mentorship' });
    }
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `insert into messages (mentorship_request_id, sender_id, content, is_read, created_at)
                 values ($1, $2, $3, false, now()) returning id`;
      const { rows } = await client.query(q, [id, userId, content.trim()]);
      res.json({ id: rows[0]?.id });
    } finally { await client.end(); }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message', detail: (error as any)?.message });
  }
});

// Student: list my current mentors (accepted requests)
router.get('/my-mentors', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `
        select mr.id,
               mr.mentor_id as "mentorId",
               p.name as "mentorName",
               p.email as "mentorEmail"
        from mentorship_requests mr
        left join profiles p on p.user_id = mr.mentor_id
        where mr.student_id = $1 and mr.status = 'accepted'
        order by mr.created_at desc`;
      const { rows } = await client.query(q, [userId]);
      res.json(rows.map((r: any) => ({
        id: r.id,
        mentorId: r.mentorid || r.mentorId,
        mentorName: r.mentorname || r.mentorName,
        mentorEmail: r.mentoremail || r.mentorEmail,
      })));
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error fetching current mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors', detail: (error as any)?.message });
  }
});

// Mentor capacity: number of accepted mentees and whether full (>=5)
router.get('/mentor/:id/capacity', async (req, res) => {
  try {
    const { id } = req.params;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `select count(*)::int as c from mentorship_requests where mentor_id = $1 and status = 'accepted'`;
      const { rows } = await client.query(q, [id]);
      const accepted = Number(rows?.[0]?.c || 0);
      res.json({ accepted, full: accepted >= 5 });
    } finally { await client.end(); }
  } catch (error) {
    console.error('Error fetching mentor capacity:', error);
    res.status(500).json({ error: 'Failed to fetch mentor capacity' });
  }
});

// Student active usage: active (pending+accepted) count
router.get('/student/active-usage', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `select count(*)::int as c from mentorship_requests where student_id = $1 and status in ('pending','accepted')`;
      const { rows } = await client.query(q, [userId]);
      const active = Number(rows?.[0]?.c || 0);
      res.json({ active, limit: 5, remaining: Math.max(0, 5 - active) });
    } finally { await client.end(); }
  } catch (error) {
    console.error('Error fetching student active usage:', error);
    res.status(500).json({ error: 'Failed to fetch usage' });
  }
});

// Reviews summary and list for a mentor (by mentorId)
router.get('/mentor/:mentorId/reviews', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `
        select r.id as "reviewId",
               r.rating,
               r.comment,
               r.created_at as "createdAt",
               mr.id as "requestId",
               s.name as "studentName"
        from mentorship_reviews r
        join mentorship_requests mr on mr.id = r.mentorship_request_id
        left join profiles s on s.user_id = mr.student_id
        where mr.mentor_id = $1
        order by r.created_at desc
        limit 20`;
      const { rows } = await client.query(q, [mentorId]);
      const countQ = `select count(*)::int as c, coalesce(avg(rating),0) as avg from mentorship_reviews r
                      join mentorship_requests mr on mr.id = r.mentorship_request_id
                      where mr.mentor_id = $1`;
      const { rows: agg } = await client.query(countQ, [mentorId]);
      const average = Number(agg?.[0]?.avg || 0);
      const count = Number(agg?.[0]?.c || 0);
      res.json({ average, count, reviews: rows.map(r => ({
        reviewId: r.reviewId,
        rating: Number(r.rating),
        comment: r.comment,
        createdAt: (r.createdAt ? new Date(r.createdAt) : new Date()).toISOString(),
        requestId: r.requestId,
        studentName: r.studentName || 'Student'
      })) });
    } finally { await client.end(); }
  } catch (error) {
    console.error('Error fetching mentor reviews:', error);
    res.status(500).json({ error: 'Failed to fetch mentor reviews' });
  }
});

// Create a mentorship request (student -> alumni)
router.post('/requests', async (req, res) => {
  try {
    const userId = (req as any).user!.userId; // student
    const { mentorId, fieldOfInterest, description, goals, preferredTime } = req.body as {
      mentorId: string;
      fieldOfInterest?: string;
      description?: string;
      goals?: string | null;
      preferredTime?: string | null;
    };

    if (!mentorId) {
      return res.status(400).json({ error: 'mentorId is required' });
    }

    // Mentor must be a valid user id
    const mentorUser = await db.select().from(users).where(eq(users.id, mentorId)).limit(1);
    if (mentorUser.length === 0) {
      return res.status(404).json({ error: 'Mentor user not found. Please refresh and try again.' });
    }

    // Ensure profiles exist for both student and mentor to satisfy FK
    const ensureProfile = async (uid: string) => {
      const existingProfile = await db.select().from(profiles).where(eq(profiles.userId, uid)).limit(1);
      if (existingProfile.length > 0) return existingProfile[0];
      const userRow = await db.select().from(users).where(eq(users.id, uid)).limit(1);
      if (userRow.length === 0) {
        throw new Error('User not found for profile creation');
      }
      const u = userRow[0] as any;
      const [createdProfile] = await db.insert(profiles).values({
        userId: uid,
        name: u.name || u.email || 'User',
        email: u.email || 'unknown@example.com',
        role: u.role || 'student',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return createdProfile;
    };

    try {
      await ensureProfile(userId);
      await ensureProfile(mentorId);
    } catch (e: any) {
      return res.status(400).json({ error: e.message || 'Failed to ensure profiles' });
    }

    // Double-check profiles actually exist for both sides
    const [studentProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const [mentorProfile] = await db.select().from(profiles).where(eq(profiles.userId, mentorId)).limit(1);
    if (!studentProfile) {
      return res.status(400).json({ error: 'Student profile missing; cannot create request' });
    }
    if (!mentorProfile) {
      return res.status(400).json({ error: 'Mentor profile missing; cannot create request' });
    }

    // Enforce limits
    try {
      // Student: max 5 active (pending or accepted)
      const activeStudent = await db.execute(sql`select count(*)::int as c from mentorship_requests where student_id = ${userId} and status in ('pending','accepted')`);
      const studentActiveCount = Number((activeStudent as any)?.rows?.[0]?.c || 0);
      if (studentActiveCount >= 5) {
        return res.status(409).json({ error: 'You have reached the limit of 5 active mentorship requests.' });
      }
      // Mentor: max 5 accepted mentees
      const acceptedMentor = await db.execute(sql`select count(*)::int as c from mentorship_requests where mentor_id = ${mentorId} and status = 'accepted'`);
      const mentorAcceptedCount = Number((acceptedMentor as any)?.rows?.[0]?.c || 0);
      if (mentorAcceptedCount >= 5) {
        return res.status(409).json({ error: 'This mentor is at full capacity (5 mentees).' });
      }
    } catch (e) {
      // Non-fatal; continue if counts fail
      console.warn('Capacity checks failed:', (e as any)?.message);
    }

    // Prevent duplicate active requests (pending/accepted/completed) between same pair
    try {
      const active = await db.execute(sql`
        select * from mentorship_requests
        where student_id = ${userId} and mentor_id = ${mentorId} and status in ('pending','accepted','completed')
        order by created_at desc
        limit 1
      `);
      const existingActive = (active as any)?.rows?.[0];
      if (existingActive) {
        console.log('🚫 Duplicate request prevented:', {
          student: userId,
          mentor: mentorId,
          existingStatus: existingActive.status,
          existingId: existingActive.id
        });
        return res.status(409).json({ 
          error: `You already have a ${existingActive.status} mentorship request with this mentor.`,
          request: existingActive, 
          existing: true 
        });
      }
    } catch (e) {
      console.warn('Warning: active duplicate check failed:', (e as any)?.message);
    }

    let created;
    try {
      // Step 1: insert minimal required columns (use raw SQL to only set needed columns)
      const field = fieldOfInterest || 'General Mentorship';
      const inserted = await db.execute(
        sql`insert into mentorship_requests (student_id, mentor_id, field_of_interest, status, created_at, updated_at)
             values (${userId}, ${mentorId}, ${field}, 'pending', now(), now()) returning id`
      );
      let createdId = (inserted as any)?.rows?.[0]?.id;
      created = { id: createdId } as any;

      // Fallback: some drivers may not return rows on execute; fetch the latest row for this pair
      if (!createdId) {
        try {
          const fallback = await db
            .select()
            .from(mentorshipRequests)
            .where(and(eq(mentorshipRequests.studentId, userId), eq(mentorshipRequests.mentorId, mentorId)));
          if (fallback.length > 0) {
            createdId = (fallback[fallback.length - 1] as any).id;
            created = { id: createdId } as any;
          }
        } catch {}
      }

      // Step 2: update optional fields if provided
      const toSet: any = {};
      if (description != null && description !== '') toSet.description = description;
      if (goals != null && goals !== '') toSet.goals = goals;
      if (preferredTime != null && preferredTime !== '') toSet.preferredTime = preferredTime;
      if (created.id && Object.keys(toSet).length > 0) {
        await db.update(mentorshipRequests)
          .set({ ...toSet, updatedAt: new Date() })
          .where(eq(mentorshipRequests.id, created.id));
      }
      // Final fetch
      if (created.id) {
        const refreshed = await db
          .select()
          .from(mentorshipRequests)
          .where(eq(mentorshipRequests.id, created.id))
          .limit(1);
        created = refreshed[0] || created;
      }
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (msg.toLowerCase().includes('foreign key')) {
        return res.status(400).json({ error: 'Foreign key constraint failed creating request. Ensure both profiles exist.', code: e?.code, detail: e?.detail, constraint: e?.constraint } as any);
      }
      // Surface more error context to the client for debugging in dev
      return res.status(500).json({ error: msg, code: e?.code, detail: e?.detail, constraint: e?.constraint, table: e?.table });
    }

    res.json({ request: created });
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    res.status(500).json({ error: (error as any)?.message || 'Failed to create mentorship request' });
  }
});

// Get mentorship requests for current user (as mentor)
router.get('/my-requests', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const cs = process.env.DATABASE_URL as string;
    const client = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const q = `
        select mr.id,
               mr.student_id as "studentId",
               mr.mentor_id as "mentorId",
               mr.field_of_interest as "fieldOfInterest",
               mr.description,
               mr.goals,
               mr.preferred_time as "preferredTime",
               mr.status,
               mr.created_at as "createdAt",
               p.name as "studentName",
               p.email as "studentEmail",
               p.department as "studentDepartment",
               p.graduation_year as "studentYear"
        from mentorship_requests mr
        left join profiles p on p.user_id = mr.student_id
        where mr.mentor_id = $1
        order by mr.created_at desc`;
      const { rows } = await client.query(q, [userId]);
      const transformed = rows.map((r: any) => ({
        id: r.id,
        studentName: r.studentname || r.studentName || 'Unknown Student',
        studentEmail: r.studentemail || r.studentEmail || '',
        studentDepartment: r.studentdepartment || r.studentDepartment || '',
        studentYear: r.studentyear ? String(r.studentyear) : (r.studentYear ? String(r.studentYear) : ''),
        subject: r.fieldofinterest || r.fieldOfInterest,
        goals: r.goals || '',
        preferredTime: r.preferredtime || r.preferredTime || 'Flexible',
        message: r.description || '',
        status: (r.status as 'pending' | 'accepted' | 'declined' | 'completed'),
        createdAt: (r.createdat ? new Date(r.createdat) : (r.createdAt ? new Date(r.createdAt) : new Date())).toISOString(),
      }));
      res.json(transformed);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error fetching mentorship requests:', error);
    res.status(500).json({ error: 'Failed to fetch mentorship requests', detail: (error as any)?.message, code: (error as any)?.code });
  }
});

// Update mentorship request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user!.userId;

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

// Get mentorship request details
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = (req as any).user!.userId;

    const [request] = await db
      .select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId))
      .limit(1);

    if (!request) return res.status(404).json({ error: 'Mentorship request not found' });
    if (request.studentId !== userId && request.mentorId !== userId) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    res.json({
      id: request.id,
      studentId: request.studentId,
      mentorId: request.mentorId,
      status: request.status,
    });
  } catch (err) {
    console.error('Fetch request failed', err);
    res.status(500).json({ error: 'Failed to fetch request details' });
  }
});

// Close chat (mentor only)
router.post('/:requestId/close-chat', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body as { reason: string };
    const userId = (req as any).user!.userId;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const request = await db.select()
      .from(mentorshipRequests)
      .where(eq(mentorshipRequests.id, requestId))
      .limit(1);

    if (request.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request[0].mentorId !== userId) {
      return res.status(403).json({ error: 'Only mentor can close chat' });
    }

    await db.update(mentorshipRequests)
      .set({ chatClosedReason: reason.trim(), chatClosedAt: new Date(), updatedAt: new Date() })
      .where(eq(mentorshipRequests.id, requestId));

    res.json({ message: 'Chat closed' });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ error: 'Failed to close chat' });
  }
});
// Submit a review for a mentorship (student only)
router.post('/:id/review', async (req, res) => {
  try {
    const userId = (req as any).user!.userId;
    const { id } = req.params;
    const { rating, comment } = req.body as { rating: number; comment?: string };

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const requestRows = await db.select().from(mentorshipRequests).where(eq(mentorshipRequests.id, id)).limit(1);
    if (requestRows.length === 0) return res.status(404).json({ error: 'Mentorship request not found' });
    const reqRow = requestRows[0];

    if (reqRow.studentId !== userId) {
      return res.status(403).json({ error: 'Only the student can submit a review' });
    }

    if (!(reqRow.status === 'completed' || (reqRow as any).chatClosedAt)) {
      return res.status(409).json({ error: 'You can review after the mentorship ends' });
    }

    const existing = await db.select().from(mentorshipReviews)
      .where(and(eq(mentorshipReviews.mentorshipRequestId, id), eq(mentorshipReviews.reviewerId, userId)))
      .limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Review already submitted' });
    }

    const [created] = await db.insert(mentorshipReviews).values({
      mentorshipRequestId: id,
      reviewerId: userId,
      rating,
      comment: comment || null,
      createdAt: new Date(),
    }).returning();

    res.json({ review: created });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Get reviews and summary for a mentorship
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await db.select().from(mentorshipReviews)
      .where(eq(mentorshipReviews.mentorshipRequestId, id));

    const total = reviews.length;
    const average = total ? (reviews.reduce((s, r: any) => s + (r.rating || 0), 0) / total) : 0;
    res.json({ reviews, count: total, average });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;