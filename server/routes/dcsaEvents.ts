import { Router } from 'express';
import { db } from '../db';
import { events, eventRegistrations, profiles, users, studentProfiles } from '../../shared/schema';
import { authMiddleware, AuthRequest, adminMiddleware } from '../middleware/auth';
import { and, desc, eq, ilike, inArray, sql } from 'drizzle-orm';

const router = Router();

type NewEvent = typeof events.$inferInsert;
type EventRecord = typeof events.$inferSelect;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return isNaN(date.getTime()) ? null : date;
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
};

const toStringArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    const arr = value.map((item) => String(item).trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  if (typeof value === 'string') {
    const parts = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }
  return null;
};

const toJSON = <T>(value: unknown): T | null => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'object') return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return null;
};

const EVENT_STATUS_VALUES = ['draft', 'pending', 'approved', 'rejected', 'cancelled'] as const;
type EventStatus = typeof EVENT_STATUS_VALUES[number];
const EVENT_STATUS_SET = new Set<EventStatus>(EVENT_STATUS_VALUES);

const EVENT_VISIBILITY_VALUES = ['public', 'students', 'alumni', 'faculty'] as const;
type EventVisibility = typeof EVENT_VISIBILITY_VALUES[number];
const EVENT_VISIBILITY_SET = new Set<EventVisibility>(EVENT_VISIBILITY_VALUES);

interface OrganizerDetails {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
}

interface DepartmentCount {
  department: string | null;
  count: number;
}

interface EventResponseOptions {
  organizer?: OrganizerDetails | null;
  participantTotal?: number;
  participantByDept?: DepartmentCount[];
}

const buildEventResponse = (event: EventRecord, options: EventResponseOptions = {}) => {
  const organizer = event.organizerId
    ? options.organizer ?? { id: event.organizerId, name: null, email: null, role: null }
    : null;

  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    description: event.description,
    summary: event.summary,
    event_type: event.eventType,
    organized_by: event.organizedBy,
    club: event.club,
    department: event.department,
    target_audience: event.targetAudience ?? null,
    visibility: event.visibility,
    start_date: event.dateTime ? event.dateTime.toISOString() : null,
    end_date: event.endDateTime ? event.endDateTime.toISOString() : null,
    venue: event.venue,
    location: event.location,
    city: event.city,
    state: event.state,
    country: event.country,
    registration_required: event.registrationRequired ?? true,
    registration_deadline: event.registrationDeadline ? event.registrationDeadline.toISOString() : null,
    registration_link: event.registrationLink,
    max_participants: event.maxAttendees ?? null,
    waitlist_enabled: event.waitlistEnabled ?? false,
    is_paid: event.isPaid ?? false,
    fee_amount: event.feeAmount ? Number(event.feeAmount) : null,
    fee_currency: event.feeCurrency ?? 'INR',
    guest_speakers: event.guestSpeakers,
    agenda: event.agenda,
    resources: event.resources,
    poster_url: event.posterUrl,
    banner_url: event.bannerUrl,
    image_gallery: event.imageGallery,
    livestream_link: event.livestreamLink,
    status: event.status,
    approval_notes: event.approvalNotes,
    organizer,
    created_by_id: event.createdById,
    created_by_role: event.createdByRole,
    approved_by_id: event.approvedById,
    approved_at: event.approvedAt ? event.approvedAt.toISOString() : null,
    primary_contact: event.primaryContactName
      ? { name: event.primaryContactName, email: event.primaryContactEmail, phone: event.primaryContactPhone }
      : null,
    tags: event.tags,
    metadata: event.metadata,
    participant_summary: {
      total: options.participantTotal ?? 0,
      by_department: options.participantByDept ?? [],
    },
    created_at: event.createdAt ? event.createdAt.toISOString() : null,
    updated_at: event.updatedAt ? event.updatedAt.toISOString() : null,
  };
};

router.get('/events', async (req, res) => {
  try {
    const { status, visibility, department, club, search } = req.query;

    const filters: any[] = [];

    const statusValue = typeof status === 'string' ? status.toLowerCase() : undefined;
    if (statusValue) {
      if (statusValue !== 'all' && EVENT_STATUS_SET.has(statusValue as EventStatus)) {
        filters.push(eq(events.status, statusValue as EventStatus));
      }
    } else {
      filters.push(eq(events.status, 'approved'));
    }

    const visibilityValue = typeof visibility === 'string' ? visibility.toLowerCase() : undefined;
    if (visibilityValue && visibilityValue !== 'all' && EVENT_VISIBILITY_SET.has(visibilityValue as EventVisibility)) {
      filters.push(eq(events.visibility, visibilityValue as EventVisibility));
    }

    if (department && typeof department === 'string' && department.trim()) {
      filters.push(ilike(events.department, `%${department.trim()}%`));
    }

    if (club && typeof club === 'string' && club.trim()) {
      filters.push(ilike(events.club, `%${club.trim()}%`));
    }

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      filters.push(sql`(${events.title} ILIKE ${term} OR ${events.description} ILIKE ${term} OR ${events.summary} ILIKE ${term})`);
    }

    let selectQuery = db
      .select({
        id: events.id,
        title: events.title,
        slug: events.slug,
        description: events.description,
        summary: events.summary,
        eventType: events.eventType,
        organizedBy: events.organizedBy,
        club: events.club,
        department: events.department,
        targetAudience: events.targetAudience,
        visibility: events.visibility,
        dateTime: events.dateTime,
        endDateTime: events.endDateTime,
        venue: events.venue,
        location: events.location,
        city: events.city,
        state: events.state,
        country: events.country,
        registrationRequired: events.registrationRequired,
        registrationDeadline: events.registrationDeadline,
        registrationLink: events.registrationLink,
        maxAttendees: events.maxAttendees,
        waitlistEnabled: events.waitlistEnabled,
        isPaid: events.isPaid,
        feeAmount: events.feeAmount,
        feeCurrency: events.feeCurrency,
        guestSpeakers: events.guestSpeakers,
        agenda: events.agenda,
        resources: events.resources,
        posterUrl: events.posterUrl,
        bannerUrl: events.bannerUrl,
        imageGallery: events.imageGallery,
        livestreamLink: events.livestreamLink,
        status: events.status,
        approvalNotes: events.approvalNotes,
        organizerId: events.organizerId,
        createdById: events.createdById,
        createdByRole: events.createdByRole,
        approvedById: events.approvedById,
        approvedAt: events.approvedAt,
        primaryContactName: events.primaryContactName,
        primaryContactEmail: events.primaryContactEmail,
        primaryContactPhone: events.primaryContactPhone,
        tags: events.tags,
        metadata: events.metadata,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events);

    if (filters.length) {
      selectQuery = selectQuery.where(and(...filters));
    }

    const eventRows = await selectQuery.orderBy(desc(events.dateTime), desc(events.createdAt));

    const eventIds = eventRows.map((row) => row.id).filter(Boolean);

    const [counts, byDept, organizerProfiles] = await Promise.all([
      eventIds.length
        ? db
            .select({ eventId: eventRegistrations.eventId, total: sql<number>`COUNT(*)` })
            .from(eventRegistrations)
            .where(inArray(eventRegistrations.eventId, eventIds))
            .groupBy(eventRegistrations.eventId)
        : Promise.resolve([]),
      eventIds.length
        ? db
            .select({
              eventId: eventRegistrations.eventId,
              department: eventRegistrations.department,
              total: sql<number>`COUNT(*)`,
            })
            .from(eventRegistrations)
            .where(inArray(eventRegistrations.eventId, eventIds))
            .groupBy(eventRegistrations.eventId, eventRegistrations.department)
        : Promise.resolve([]),
      eventRows.length
        ? db
            .select({ userId: profiles.userId, name: profiles.name, email: profiles.email, role: profiles.role })
            .from(profiles)
            .where(inArray(profiles.userId, eventRows.map((row) => row.organizerId).filter(Boolean)))
        : Promise.resolve([]),
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((row) => {
      if (row.eventId) countMap.set(row.eventId, Number(row.total) || 0);
    });

    const deptMap = new Map<string, { department: string | null; count: number }[]>();
    byDept.forEach((row) => {
      if (!row.eventId) return;
      const list = deptMap.get(row.eventId) ?? [];
      list.push({ department: row.department, count: Number(row.total) || 0 });
      deptMap.set(row.eventId, list);
    });

    const organizerMap = new Map<string, { name: string | null; email: string | null; role: string | null }>();
    organizerProfiles.forEach((p) => {
      organizerMap.set(p.userId, { name: p.name ?? null, email: p.email ?? null, role: p.role ?? null });
    });

    const payload = eventRows.map((row) => {
      const organizer = row.organizerId ? organizerMap.get(row.organizerId) : null;
      return buildEventResponse(row, {
        organizer: row.organizerId
          ? {
              id: row.organizerId,
              name: organizer?.name ?? null,
              email: organizer?.email ?? null,
              role: organizer?.role ?? null,
            }
          : null,
        participantTotal: countMap.get(row.id) ?? 0,
        participantByDept: deptMap.get(row.id) ?? [],
      });
    });

    res.json(payload);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/events', authMiddleware, async (req, res) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const isAdmin = user.role === 'admin';
    const allowedRoles = new Set(['admin', 'alumni']);
    if (!allowedRoles.has(user.role)) {
      return res.status(403).json({ error: 'Only admins or alumni can create events' });
    }

    const {
      title,
      description,
      summary,
      event_type,
      organized_by,
      club,
      department,
      target_audience,
      visibility,
      start_date,
      end_date,
      venue,
      location,
      city,
      state,
      country,
      registration_required,
      registration_deadline,
      registration_link,
      max_participants,
      waitlist_enabled,
      is_paid,
      fee_amount,
      fee_currency,
      guest_speakers,
      agenda,
      resources,
      poster_url,
      banner_url,
      image_gallery,
      livestream_link,
      primary_contact,
      tags,
      metadata,
    } = req.body ?? {};

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const eventPayload: NewEvent = {
      title: title.trim(),
      slug: slugify(title.trim()),
      description: typeof description === 'string' ? description.trim() : description ?? null,
      summary: typeof summary === 'string' ? summary.trim() : summary ?? null,
      eventType: typeof event_type === 'string' ? event_type.trim() : event_type ?? null,
      organizedBy: typeof organized_by === 'string' ? organized_by.trim() : organized_by ?? null,
      club: typeof club === 'string' ? club.trim() : club ?? null,
      department: typeof department === 'string' ? department.trim() : department ?? null,
      targetAudience: toStringArray(target_audience),
      visibility: EVENT_VISIBILITY_SET.has((visibility ?? '').toLowerCase())
        ? (visibility ?? '').toLowerCase() as EventVisibility
        : 'public',
      dateTime: parseDate(start_date) ?? new Date(),
      endDateTime: parseDate(end_date),
      venue: typeof venue === 'string' ? venue.trim() : venue ?? null,
      location: typeof location === 'string' ? location.trim() : location ?? null,
      city: typeof city === 'string' ? city.trim() : city ?? null,
      state: typeof state === 'string' ? state.trim() : state ?? null,
      country: typeof country === 'string' ? country.trim() : country ?? null,
      registrationRequired: toBoolean(registration_required, true),
      registrationDeadline: parseDate(registration_deadline),
      registrationLink: typeof registration_link === 'string' ? registration_link.trim() : registration_link ?? null,
      maxAttendees: toNumber(max_participants),
      waitlistEnabled: toBoolean(waitlist_enabled, false),
      isPaid: toBoolean(is_paid, false),
      feeAmount: toNumber(fee_amount),
      feeCurrency: typeof fee_currency === 'string' ? fee_currency.trim() : 'INR',
      guestSpeakers: toJSON(guest_speakers),
      agenda: toJSON(agenda),
      resources: toJSON(resources),
      posterUrl: typeof poster_url === 'string' ? poster_url.trim() : poster_url ?? null,
      bannerUrl: typeof banner_url === 'string' ? banner_url.trim() : banner_url ?? null,
      imageGallery: toJSON(image_gallery),
      livestreamLink: typeof livestream_link === 'string' ? livestream_link.trim() : livestream_link ?? null,
      status: isAdmin ? 'approved' : 'pending',
      approvalNotes: null,
      organizerId: user.userId,
      createdById: user.userId,
      createdByRole: user.role,
      approvedById: isAdmin ? user.userId : null,
      approvedAt: isAdmin ? new Date() : null,
      primaryContactName: primary_contact?.name ?? null,
      primaryContactEmail: primary_contact?.email ?? null,
      primaryContactPhone: primary_contact?.phone ?? null,
      tags: toStringArray(tags),
      metadata: toJSON(metadata),
    };

    const [insertedEvent] = await db.insert(events).values(eventPayload).returning();

    // Fetch organizer details for complete response
    const [organizerProfile] = insertedEvent.organizerId
      ? await db
          .select({ userId: profiles.userId, name: profiles.name, email: profiles.email, role: profiles.role })
          .from(profiles)
          .where(eq(profiles.userId, insertedEvent.organizerId))
          .limit(1)
      : [null];

    const response = buildEventResponse(insertedEvent, {
      organizer: organizerProfile
        ? {
            id: organizerProfile.userId,
            name: organizerProfile.name ?? null,
            email: organizerProfile.email ?? null,
            role: organizerProfile.role ?? null,
          }
        : null,
      participantTotal: 0,
      participantByDept: [],
    });

    res.status(201).json({ message: 'Event created', event: response });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.put('/events/:eventId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const [existing] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const {
      title,
      description,
      summary,
      event_type,
      organized_by,
      club,
      department,
      target_audience,
      visibility,
      start_date,
      end_date,
      venue,
      location,
      city,
      state,
      country,
      registration_required,
      registration_deadline,
      registration_link,
      max_participants,
      waitlist_enabled,
      is_paid,
      fee_amount,
      fee_currency,
      guest_speakers,
      agenda,
      resources,
      poster_url,
      banner_url,
      image_gallery,
      livestream_link,
      primary_contact,
      tags,
      metadata,
      status,
      approval_notes,
    } = req.body ?? {};

    if (title && typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string' });
    }

    const updates: Partial<NewEvent> = {
      title: typeof title === 'string' ? title.trim() : existing.title,
      slug: typeof title === 'string' && title.trim() ? slugify(title.trim()) : existing.slug,
      description: typeof description === 'string' ? description.trim() : description ?? existing.description,
      summary: typeof summary === 'string' ? summary.trim() : summary ?? existing.summary,
      eventType: typeof event_type === 'string' ? event_type.trim() : event_type ?? existing.eventType,
      organizedBy: typeof organized_by === 'string' ? organized_by.trim() : organized_by ?? existing.organizedBy,
      club: typeof club === 'string' ? club.trim() : club ?? existing.club,
      department: typeof department === 'string' ? department.trim() : department ?? existing.department,
      targetAudience: target_audience !== undefined ? toStringArray(target_audience) : existing.targetAudience,
      visibility: visibility
        ? EVENT_VISIBILITY_SET.has((visibility ?? '').toLowerCase() as EventVisibility)
          ? ((visibility ?? '').toLowerCase() as EventVisibility)
          : existing.visibility
        : existing.visibility,
      dateTime: start_date !== undefined ? parseDate(start_date) ?? existing.dateTime : existing.dateTime,
      endDateTime: end_date !== undefined ? parseDate(end_date) : existing.endDateTime,
      venue: typeof venue === 'string' ? venue.trim() : venue ?? existing.venue,
      location: typeof location === 'string' ? location.trim() : location ?? existing.location,
      city: typeof city === 'string' ? city.trim() : city ?? existing.city,
      state: typeof state === 'string' ? state.trim() : state ?? existing.state,
      country: typeof country === 'string' ? country.trim() : country ?? existing.country,
      registrationRequired:
        registration_required !== undefined ? toBoolean(registration_required, existing.registrationRequired ?? true) : existing.registrationRequired,
      registrationDeadline:
        registration_deadline !== undefined ? parseDate(registration_deadline) : existing.registrationDeadline,
      registrationLink: typeof registration_link === 'string' ? registration_link.trim() : registration_link ?? existing.registrationLink,
      maxAttendees: max_participants !== undefined ? toNumber(max_participants) : existing.maxAttendees,
      waitlistEnabled: waitlist_enabled !== undefined ? toBoolean(waitlist_enabled, existing.waitlistEnabled ?? false) : existing.waitlistEnabled,
      isPaid: is_paid !== undefined ? toBoolean(is_paid, existing.isPaid ?? false) : existing.isPaid,
      feeAmount: fee_amount !== undefined ? toNumber(fee_amount) : existing.feeAmount,
      feeCurrency: typeof fee_currency === 'string' ? fee_currency.trim() : existing.feeCurrency,
      guestSpeakers: guest_speakers !== undefined ? toJSON(guest_speakers) : existing.guestSpeakers,
      agenda: agenda !== undefined ? toJSON(agenda) : existing.agenda,
      resources: resources !== undefined ? toJSON(resources) : existing.resources,
      posterUrl: typeof poster_url === 'string' ? poster_url.trim() : poster_url ?? existing.posterUrl,
      bannerUrl: typeof banner_url === 'string' ? banner_url.trim() : banner_url ?? existing.bannerUrl,
      imageGallery: image_gallery !== undefined ? toJSON(image_gallery) : existing.imageGallery,
      livestreamLink: typeof livestream_link === 'string' ? livestream_link.trim() : livestream_link ?? existing.livestreamLink,
      primaryContactName: primary_contact?.name ?? existing.primaryContactName,
      primaryContactEmail: primary_contact?.email ?? existing.primaryContactEmail,
      primaryContactPhone: primary_contact?.phone ?? existing.primaryContactPhone,
      tags: tags !== undefined ? toStringArray(tags) : existing.tags,
      metadata: metadata !== undefined ? toJSON(metadata) : existing.metadata,
      approvalNotes: approval_notes !== undefined ? (typeof approval_notes === 'string' ? approval_notes : null) : existing.approvalNotes,
    };

    if (status && EVENT_STATUS_SET.has(status)) {
      updates.status = status as EventStatus;
      updates.approvedById = ['approved', 'rejected'].includes(status)
        ? (req as AuthRequest).user?.userId ?? existing.approvedById
        : existing.approvedById;
      updates.approvedAt = ['approved', 'rejected'].includes(status) ? new Date() : existing.approvedAt;
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, eventId))
      .returning();

    const response = buildEventResponse(updated);

    res.json({ message: 'Event updated', event: response });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.put('/events/:eventId/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, approval_notes } = req.body ?? {};

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    if (!status || !EVENT_STATUS_SET.has(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [existing] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!existing) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const adminUser = (req as AuthRequest).user!;

    const [updated] = await db
      .update(events)
      .set({
        status: status as EventStatus,
        approvalNotes: approval_notes ?? null,
        approvedById: adminUser.userId,
        approvedAt: ['approved', 'rejected'].includes(status) ? new Date() : null,
      })
      .where(eq(events.id, eventId))
      .returning();

    const response = buildEventResponse(updated);

    res.json({ message: 'Event status updated', event: response });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ error: 'Failed to update event status' });
  }
});

router.get('/events/my-participation', authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;

    const rows = await db
      .select({
        eventId: eventRegistrations.eventId,
        registeredAt: eventRegistrations.registeredAt,
        department: events.department,
        title: events.title,
        location: events.location,
      })
      .from(eventRegistrations)
      .innerJoin(events, eq(events.id, eventRegistrations.eventId))
      .where(eq(eventRegistrations.userId, userId));

    const payload = rows.map((row) => ({
      event_id: row.eventId,
      approval_status: 'approved',
      attendance_status: 'Registered',
      program: null,
      department: row.department,
      notes: null,
      registered_at: row.registeredAt ? row.registeredAt.toISOString() : null,
      event_title: row.title,
      venue: row.location,
    }));

    res.json(payload);
  } catch (error) {
    console.error('Error fetching participation:', error);
    res.status(500).json({ error: 'Failed to load participation' });
  }
});

router.post('/events/:eventId/participation', authMiddleware, async (req, res) => {
  try {
    const userId = (req as AuthRequest).user!.userId;
    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const existingEvent = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (existingEvent.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventRecord = existingEvent[0];

    if (eventRecord.status !== 'approved') {
      return res.status(400).json({ error: 'Event is not open for participation' });
    }

    if (eventRecord.registrationDeadline && new Date(eventRecord.registrationDeadline) < new Date()) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    if (eventRecord.maxAttendees && eventRecord.maxAttendees > 0) {
      const currentCount = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(eventRegistrations)
        .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.participantStatus, 'approved')))
        .limit(1);

      const approvedCount = currentCount.length ? Number(currentCount[0].total) : 0;

      if (!eventRecord.waitlistEnabled && approvedCount >= eventRecord.maxAttendees) {
        return res.status(400).json({ error: 'Event capacity reached' });
      }
    }

    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
      .limit(1);

    if (existingRegistration.length > 0) {
      return res.status(400).json({ error: 'Participation already requested' });
    }

    await db.insert(eventRegistrations).values({
      eventId,
      userId,
      registeredAt: new Date(),
      participantStatus: 'approved',
      department: eventRecord.department,
      program: null,
      club: eventRecord.club,
      notes: req.body?.notes ?? null,
    });

    res.json({ message: 'Participation request submitted' });
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(400).json({ error: 'Participation already requested' });
    }

    console.error('Error creating participation:', error);
    res.status(500).json({ error: 'Failed to submit participation request' });
  }
});

// Admin endpoint to view all participants for an event
router.get('/events/:eventId/participants', authMiddleware, async (req, res) => {
  try {
    const user = (req as AuthRequest).user;
    const { eventId } = req.params;

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Check if event exists
    const [eventRecord] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    
    if (!eventRecord) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check authorization: admins can view all, alumni can only view their own events
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';
    const isEventOrganizer = user.role === 'alumni' && eventRecord.organizerId === user.userId;
    
    if (!isAdmin && !isEventOrganizer) {
      return res.status(403).json({ error: 'You can only view participants for your own events' });
    }

    // Get all participants with user details and profile information
    const participants = await db
      .select({
        id: eventRegistrations.id,
        userId: eventRegistrations.userId,
        registeredAt: eventRegistrations.registeredAt,
        participantStatus: eventRegistrations.participantStatus,
        attendanceStatus: eventRegistrations.attendanceStatus,
        department: eventRegistrations.department,
        program: eventRegistrations.program,
        club: eventRegistrations.club,
        notes: eventRegistrations.notes,
        checkedInAt: eventRegistrations.checkedInAt,
        userName: users.name,
        userEmail: users.email,
        userRole: users.role,
        userStudentId: users.studentId,
        profileName: profiles.name,
        profileDepartment: profiles.department,
        studentProgram: studentProfiles.program,
        studentRollNumber: studentProfiles.rollNumber,
        studentDepartment: studentProfiles.department,
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(users.id, eventRegistrations.userId))
      .leftJoin(profiles, eq(profiles.userId, eventRegistrations.userId))
      .leftJoin(studentProfiles, eq(studentProfiles.userId, eventRegistrations.userId))
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(eventRegistrations.registeredAt);

    const response = participants.map((p) => ({
      id: p.id,
      user_id: p.userId,
      user_name: p.profileName || p.userName || 'Unknown',
      user_email: p.userEmail ?? '',
      user_role: p.userRole ?? '',
      student_id: p.userStudentId || p.studentRollNumber || null,
      registered_at: p.registeredAt ? p.registeredAt.toISOString() : null,
      participant_status: p.participantStatus ?? 'pending',
      attendance_status: p.attendanceStatus ?? null,
      department: p.studentDepartment || p.profileDepartment || p.department || null,
      program: p.studentProgram || p.program || null,
      club: p.club,
      notes: p.notes,
      checked_in_at: p.checkedInAt ? p.checkedInAt.toISOString() : null,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Mark/unmark attendance for a participant
router.patch('/events/:eventId/participants/:participantId/attendance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { eventId, participantId } = req.params;
    const { attendanceStatus } = req.body;

    if (!eventId || !participantId) {
      return res.status(400).json({ error: 'Event ID and Participant ID are required' });
    }

    // Validate attendance status
    const validStatuses = ['attended', 'absent', null];
    if (attendanceStatus !== null && !validStatuses.includes(attendanceStatus)) {
      return res.status(400).json({ error: 'Invalid attendance status' });
    }

    // Check if participant exists
    const [participant] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.id, participantId),
          eq(eventRegistrations.eventId, eventId)
        )
      )
      .limit(1);

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    // Update attendance status
    await db
      .update(eventRegistrations)
      .set({
        attendanceStatus: attendanceStatus,
        checkedInAt: attendanceStatus === 'attended' ? new Date() : null,
      })
      .where(eq(eventRegistrations.id, participantId));

    res.json({ 
      message: 'Attendance updated successfully',
      attendanceStatus: attendanceStatus
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

export default router;
