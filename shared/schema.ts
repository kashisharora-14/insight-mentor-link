
import { pgTable, uuid, text, decimal, boolean, timestamp, integer, jsonb, uniqueIndex, varchar, pgEnum, check, date } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums for Panjab University CS Department programs
export const programEnum = pgEnum('program', ['MCA', 'MSCIT']);
export const batchTypeEnum = pgEnum('batch_type', ['Morning', 'Evening']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'pending', 'approved', 'rejected', 'cancelled']);
export const eventVisibilityEnum = pgEnum('event_visibility', ['public', 'students', 'alumni', 'faculty']);
export const eventParticipantStatusEnum = pgEnum('event_participant_status', ['pending', 'approved', 'waitlisted', 'rejected', 'attended', 'cancelled']);

// Authentication Tables

// Users table - Core authentication
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'), // User's full name
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'student', 'alumni', 'admin'
  studentId: text('student_id').unique(), // Optional, only for students
  isVerified: boolean('is_verified').default(false),
  isEmailVerified: boolean('is_email_verified').default(false),
  verificationMethod: text('verification_method'), // 'csv_upload', 'admin_manual', 'pending'
  verifiedBy: uuid('verified_by'), // admin ID who verified
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Student detailed profiles
export const studentProfiles = pgTable('student_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  
  // Academic Information - Punjab University CS Department
  rollNumber: text('roll_number').unique(),
  department: text('department').notNull().default('Computer Science'), // Fixed for Punjab University CS Dept
  program: programEnum('program'), // MCA or MSCIT
  batchType: batchTypeEnum('batch_type'), // Morning or Evening
  currentYear: integer('current_year'), // 1 or 2
  batchYear: integer('batch_year'), // Graduation year
  currentSemester: integer('current_semester'), // 1-4 for 2-year programs
  cgpa: decimal('cgpa', { precision: 3, scale: 2 }),
  currentBacklog: integer('current_backlog').default(0),
  
  // Personal Details
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  gender: text('gender'),
  bloodGroup: text('blood_group'),
  category: text('category'),
  nationality: text('nationality').default('Indian'),
  religion: text('religion'),
  
  // Contact Information
  phoneNumber: text('phone_number'),
  alternateEmail: text('alternate_email'),
  permanentAddress: text('permanent_address'),
  currentAddress: text('current_address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  
  // Parent/Guardian Information
  fatherName: text('father_name'),
  fatherOccupation: text('father_occupation'),
  fatherPhone: text('father_phone'),
  motherName: text('mother_name'),
  motherOccupation: text('mother_occupation'),
  motherPhone: text('mother_phone'),
  guardianName: text('guardian_name'),
  guardianRelation: text('guardian_relation'),
  guardianPhone: text('guardian_phone'),
  
  // Additional Information
  admissionType: text('admission_type'),
  scholarshipStatus: text('scholarship_status'),
  hostelResident: boolean('hostel_resident').default(false),
  hostelRoomNumber: text('hostel_room_number'),
  transportMode: text('transport_mode'),
  
  // Skills and Interests
  technicalSkills: text('technical_skills').array(),
  softSkills: text('soft_skills').array(),
  interests: text('interests').array(),
  careerGoals: text('career_goals'),
  
  // Social Links
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Alumni detailed profiles
export const alumniProfiles = pgTable('alumni_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  
  // Academic Background - Punjab University CS Department
  rollNumber: text('roll_number').unique(),
  department: text('department').notNull().default('Computer Science'),
  program: programEnum('program'), // MCA or MSCIT
  batchType: batchTypeEnum('batch_type'), // Morning or Evening
  graduationYear: integer('graduation_year'), // Year graduated
  admissionYear: integer('admission_year'), // Year joined
  cgpa: decimal('cgpa', { precision: 3, scale: 2 }),
  
  // Personal Details
  dateOfBirth: timestamp('date_of_birth', { withTimezone: true }),
  gender: text('gender'),
  bloodGroup: text('blood_group'),
  nationality: text('nationality').default('Indian'),
  
  // Contact Information
  phoneNumber: text('phone_number'),
  alternateEmail: text('alternate_email'),
  currentAddress: text('current_address'),
  city: text('city'),
  state: text('state'),
  country: text('country').default('India'),
  pincode: text('pincode'),
  
  // Professional Information
  currentPosition: text('current_position'), // Job title
  currentCompany: text('current_company'),
  companyLocation: text('company_location'),
  industry: text('industry'), // IT, Finance, Healthcare, etc.
  workType: text('work_type'), // Remote, Hybrid, On-site
  yearsOfExperience: integer('years_of_experience'),
  previousCompanies: jsonb('previous_companies').$type<Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
  }>>(),
  
  // Expertise and Skills
  technicalSkills: text('technical_skills').array(),
  softSkills: text('soft_skills').array(),
  expertiseAreas: text('expertise_areas').array(), // Web Dev, ML, Cloud, etc.
  certifications: text('certifications').array(),
  achievements: text('achievements').array(),
  
  // Mentorship & Availability
  isMentorAvailable: boolean('is_mentor_available').default(false),
  mentorshipAreas: text('mentorship_areas').array(), // Areas they can mentor in
  availableForJobReferrals: boolean('available_for_job_referrals').default(false),
  availableForGuestLectures: boolean('available_for_guest_lectures').default(false),
  availableForNetworking: boolean('available_for_networking').default(false),
  preferredCommunication: text('preferred_communication'), // Email, Phone, LinkedIn
  maxMentees: integer('max_mentees').default(3),
  
  // Profile Content
  bio: text('bio'), // Professional summary
  careerJourney: text('career_journey'), // Their story
  adviceForStudents: text('advice_for_students'),
  
  // Social & Professional Links
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  twitterUrl: text('twitter_url'),
  personalWebsite: text('personal_website'),
  
  // Profile Visibility
  profilePictureUrl: text('profile_picture_url'),
  isPublicProfile: boolean('is_public_profile').default(true),
  showContactInfo: boolean('show_contact_info').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Email verification codes
export const verificationCodes = pgTable('verification_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  code: text('code').notNull(),
  type: text('type').notNull(), // 'registration', 'password_reset', 'email_change'
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isUsed: boolean('is_used').default(false),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Verification requests - when users register without CSV
export const verificationRequests = pgTable('verification_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  requestData: jsonb('request_data'), // Additional info provided by user
  reviewedBy: uuid('reviewed_by'), // admin ID
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// CSV upload tracking - for bulk verification
export const csvUploads = pgTable('csv_uploads', {
  id: uuid('id').defaultRandom().primaryKey(),
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  fileName: text('file_name').notNull(),
  recordsCount: integer('records_count').notNull(),
  processedCount: integer('processed_count').default(0),
  errorCount: integer('error_count').default(0),
  status: text('status').notNull().default('processing'), // 'processing', 'completed', 'failed'
  errorLog: jsonb('error_log'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pre-approved users from CSV (email or student ID whitelist)
export const approvedUsers = pgTable('approved_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email'),
  studentId: text('student_id'),
  role: text('role').notNull(), // 'student', 'alumni'
  name: text('name'),
  department: text('department'),
  graduationYear: integer('graduation_year'),
  csvUploadId: uuid('csv_upload_id').references(() => csvUploads.id),
  isUsed: boolean('is_used').default(false),
  usedBy: uuid('used_by').references(() => users.id),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueEmail: uniqueIndex('approved_email_unique').on(table.email),
  uniqueStudentId: uniqueIndex('approved_student_id_unique').on(table.studentId),
}));

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
  slug: text('slug'),
  description: text('description'),
  summary: text('summary'),
  eventType: text('event_type'),
  organizedBy: text('organized_by'),
  club: text('club'),
  department: text('department'),
  targetAudience: text('target_audience').array(),
  visibility: eventVisibilityEnum('visibility').default('public'),
  dateTime: timestamp('date_time', { withTimezone: true }),
  endDateTime: timestamp('end_date_time', { withTimezone: true }),
  venue: text('venue'),
  location: text('location'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  registrationRequired: boolean('registration_required').default(true),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  registrationLink: text('registration_link'),
  maxAttendees: integer('max_attendees'),
  waitlistEnabled: boolean('waitlist_enabled').default(false),
  isPaid: boolean('is_paid').default(false),
  feeAmount: decimal('fee_amount', { precision: 10, scale: 2 }),
  feeCurrency: text('fee_currency').default('INR'),
  guestSpeakers: jsonb('guest_speakers'),
  agenda: jsonb('agenda'),
  resources: jsonb('resources'),
  posterUrl: text('poster_url'),
  bannerUrl: text('banner_url'),
  imageGallery: jsonb('image_gallery'),
  livestreamLink: text('livestream_link'),
  status: eventStatusEnum('status').default('pending'),
  approvalNotes: text('approval_notes'),
  organizerId: uuid('organizer_id').references(() => users.id, { onDelete: 'set null' }),
  createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdByRole: text('created_by_role'),
  approvedById: uuid('approved_by_id').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  primaryContactName: text('primary_contact_name'),
  primaryContactEmail: text('primary_contact_email'),
  primaryContactPhone: text('primary_contact_phone'),
  tags: text('tags').array(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Event registrations table
export const eventRegistrations = pgTable('event_registrations', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
  participantStatus: eventParticipantStatusEnum('participant_status').default('pending'),
  attendanceStatus: eventParticipantStatusEnum('attendance_status'),
  program: text('program'),
  department: text('department'),
  club: text('club'),
  notes: text('notes'),
  isWaitlisted: boolean('is_waitlisted').default(false),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
  certificateIssued: boolean('certificate_issued').default(false),
}, (table) => ({
  uniqueEventUser: uniqueIndex('event_user_unique').on(table.eventId, table.userId),
}));

// Jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  company: text('company').notNull(),
  companyLogo: text('company_logo'), // Company logo/image URL
  location: text('location'),
  jobType: text('job_type'), // full-time, part-time, internship, contract
  salaryRange: text('salary_range'),
  requirements: text('requirements').array(),
  postedBy: uuid('posted_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postedByRole: text('posted_by_role'), // 'alumni' or 'admin'
  applicationLink: text('application_link'),
  isActive: boolean('is_active').default(true),
  status: text('status').default('pending'), // 'pending', 'approved', 'rejected' for alumni posts
  approvedBy: uuid('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  referralAvailable: boolean('referral_available').default(false),
  experienceRequired: text('experience_required'),
  skills: text('skills').array(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Job referral requests table
export const jobReferralRequests = pgTable('job_referral_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  alumniId: uuid('alumni_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('pending'), // 'pending', 'accepted', 'rejected'
  message: text('message'),
  resumeUrl: text('resume_url'),
  responseMessage: text('response_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueJobStudent: uniqueIndex('job_student_unique').on(table.jobId, table.studentId),
}));

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
  goals: text('goals'),
  preferredTime: text('preferred_time'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  chatClosedReason: text('chat_closed_reason'),
  chatClosedAt: timestamp('chat_closed_at', { withTimezone: true }),
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

// Chat blocks per mentorship request
// chatBlocks removed: simple chat flow without blocking

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

// Mentorship reviews table
export const mentorshipReviews = pgTable('mentorship_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  mentorshipRequestId: uuid('mentorship_request_id').notNull().references(() => mentorshipRequests.id, { onDelete: 'cascade' }),
  reviewerId: uuid('reviewer_id').notNull().references(() => profiles.userId, { onDelete: 'cascade' }), // student
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueReviewer: uniqueIndex('review_unique_per_request').on(table.mentorshipRequestId, table.reviewerId),
  ratingCheck: check('rating_between_1_5', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
}));
