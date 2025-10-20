import { pgTable, uuid, text, decimal, boolean, timestamp, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Donations table
export const donations = pgTable('donations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  donorName: text('donor_name').notNull(),
  donorEmail: text('donor_email').notNull(),
  message: text('message'),
  isAnonymous: boolean('is_anonymous').default(false),
  status: text('status').default('completed'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Products table for gift shop
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  category: text('category').notNull(),
  stockQuantity: integer('stock_quantity').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Orders table for gift shop
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'),
  shippingAddress: jsonb('shipping_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Events table
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dateTime: timestamp('date_time', { withTimezone: true }).notNull(),
  location: text('location'),
  department: text('department'),
  organizerId: uuid('organizer_id').notNull(),
  registrationLink: text('registration_link'),
  imageUrl: text('image_url'),
  maxAttendees: integer('max_attendees'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Event registrations table
export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueEventUser: uniqueIndex('event_user_unique').on(table.eventId, table.userId),
}));

// Jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  jobType: text('job_type'),
  salaryRange: text('salary_range'),
  requirements: text('requirements').array(),
  postedBy: uuid('posted_by').notNull(),
  applicationLink: text('application_link'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Profiles table for alumni and students
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  graduationYear: integer('graduation_year'),
  department: text('department'),
  currentJob: text('current_job'),
  company: text('company'),
  skills: text('skills').array(),
  linkedinProfile: text('linkedin_profile'),
  phone: text('phone'),
  bio: text('bio'),
  isVerified: boolean('is_verified').default(false),
  isMentorAvailable: boolean('is_mentor_available').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Mentorship requests table
export const mentorshipRequests = pgTable('mentorship_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  mentorId: uuid('mentor_id').references(() => profiles.userId, { onDelete: 'set null' }),
  fieldOfInterest: text('field_of_interest').notNull(),
  description: text('description'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Mentorship sessions table
export const mentorshipSessions = pgTable('mentorship_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorshipRequestId: uuid('mentorship_request_id').notNull().references(() => mentorshipRequests.id, { onDelete: 'cascade' }),
  sessionDate: timestamp('session_date', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  skillsDiscussed: text('skills_discussed').array(),
  nextSessionPlan: text('next_session_plan'),
  completed: boolean('completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Messages table for mentor-mentee communication
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorshipRequestId: uuid('mentorship_request_id').notNull().references(() => mentorshipRequests.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Career roadmaps table
export const careerRoadmaps = pgTable('career_roadmaps', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => profiles.userId, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  targetPosition: text('target_position').notNull(),
  targetCompany: text('target_company'),
  timeframe: integer('timeframe').notNull(),
  currentSkills: jsonb('current_skills').default(sql`'[]'::jsonb`),
  interests: jsonb('interests').default(sql`'[]'::jsonb`),
  progress: jsonb('progress').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
});

// Roadmap items table
export const roadmapItems = pgTable('roadmap_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  roadmapId: uuid('roadmap_id').references(() => careerRoadmaps.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  priority: text('priority').notNull(),
  timeEstimate: text('time_estimate'),
  year: integer('year').notNull(),
  quarter: integer('quarter'),
  status: text('status').notNull().default('pending'),
  prerequisites: jsonb('prerequisites').default(sql`'[]'::jsonb`),
  skills: jsonb('skills').default(sql`'[]'::jsonb`),
  resources: jsonb('resources').default(sql`'[]'::jsonb`),
  alumniMentors: jsonb('alumni_mentors').default(sql`'[]'::jsonb`),
  difficulty: text('difficulty').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
});

// Yearly milestones table
export const yearlyMilestones = pgTable('yearly_milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  roadmapId: uuid('roadmap_id').references(() => careerRoadmaps.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  keySkills: jsonb('key_skills').default(sql`'[]'::jsonb`),
  majorProjects: jsonb('major_projects').default(sql`'[]'::jsonb`),
  networkingGoals: jsonb('networking_goals').default(sql`'[]'::jsonb`),
  targetAchievements: jsonb('target_achievements').default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).default(sql`timezone('utc'::text, now())`).notNull(),
});
