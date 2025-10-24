# Alumni Platform - Replit Project Setup

## Project Overview
This is a React + TypeScript alumni platform application with PostgreSQL database integration. The project was successfully migrated from Supabase to Replit's Neon PostgreSQL database.

## Key Features
- React 18 with TypeScript
- Vite for development and build tooling
- Neon PostgreSQL database (Replit managed)
- Drizzle ORM for type-safe database queries
- shadcn/ui component library
- Tailwind CSS for styling
- React Router for navigation
- TanStack Query for data fetching
- Authentication system with role-based access (Student/Alumni)

## Technical Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui with Radix UI components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query
- **Database**: PostgreSQL (Neon, managed by Replit)
- **ORM**: Drizzle ORM with Neon serverless driver
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure
- `/src` - Main application source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages/routes
  - `/contexts` - React contexts (AuthContext)
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
- `/server` - Express/TypeScript backend (port 3001)
  - `db.ts` - Database connection and Drizzle setup
  - `/routes` - API routes for student profiles, mentorship, etc.
- `/backend` - Flask/Python backend (port 3002)
  - `/routes` - Authentication, admin, and verification endpoints
  - `/utils` - Email service and utilities
  - `/models` - SQLAlchemy database models
- `/shared` - Shared code between frontend and backend
  - `schema.ts` - Drizzle ORM database schema definitions
- `/public` - Static assets

## Database Schema
The database includes the following tables:

### Authentication & Verification:
- **users** - Core user authentication and verification status
- **verification_codes** - Email verification codes
- **verification_requests** - User verification requests for admin review
- **csv_uploads** - Bulk verification via CSV upload tracking
- **approved_users** - Pre-approved users from CSV whitelist

### Platform Features:
- **donations** - Alumni donations tracking
- **products** - Gift shop merchandise
- **orders** - Gift shop order management
- **order_items** - Order line items
- **events** - University events and activities
- **event_registrations** - Event attendance tracking
- **jobs** - Job board postings
- **profiles** - User profiles (students and alumni)
- **mentorship_requests** - Mentorship program requests
- **mentorship_sessions** - Mentorship session records
- **messages** - Mentor-mentee communication
- **career_roadmaps** - Student career planning
- **roadmap_items** - Career roadmap tasks and milestones
- **yearly_milestones** - Year-by-year career goals

## Environment Configuration
The application uses the following environment variables:

### Database (automatically configured by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password

### Email Service (configured in Replit Secrets - PERMANENT):
- `MAIL_USERNAME` - Gmail address for sending emails
- `MAIL_PASSWORD` - Gmail app-specific password
- `RESEND_API_KEY` - (Optional) Resend API key for transactional emails
These credentials are stored securely in Replit Secrets and persist across all deployments

### Authentication:
- `JWT_SECRET` - Secret key for JWT token signing

## Database Commands
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Development Setup
The project runs two concurrent services:
- **Frontend (Vite)**: Port 5000 - React application with hot reload
- **Express Backend**: Port 3001 - TypeScript API for all backend functionality
- **Host**: 0.0.0.0 (allows external access)
- **Proxy**: Vite proxies `/api` requests to Express backend (port 3001)

### Running the Application
```bash
npm run dev:all  # Runs both frontend and backend concurrently
```

Individual services:
```bash
npm run dev        # Frontend only (port 5000)
npm run dev:api    # Express backend only (port 3001)
```

## Deployment Configuration
- **Target**: Autoscale (stateless deployment)
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`

## Demo Credentials
For testing purposes, the application includes mock authentication:
- Student: `student@demo.com` / `demo123`
- Alumni: `alumni@demo.com` / `demo123`

## Changes Made for Replit
1. Updated Vite configuration to use port 5000 and host 0.0.0.0
2. Fixed Supabase client to use environment variables instead of hardcoded values
3. Configured workflow for frontend development server
4. Set up deployment configuration for production

## Recent Changes
- **2025-10-24**: Fixed event attendance tracking system
  - Updated attendance count logic to properly display attended/not attended counts based on actual admin markings
  - Added "Mark Attendance" button next to each participant in event participants list
  - When admin hasn't marked attendance yet, button is displayed; when marked, shows "Marked as Attended" badge
  - Fixed TypeScript interface to include description field for events
  - Attendance counts now accurately reflect: Total Registered, Attended (marked by admin), and Not Attended (not marked)
  - Added visual badges showing attendance status for each participant
- **2025-10-20 (Latest Setup)**: Completed project import and configuration
  - Installed all npm dependencies (632 packages)
  - Fixed backend TypeScript import errors in `server/routes/alumni.ts`
  - Updated auth middleware imports from `authenticateToken` to `authMiddleware`
  - Fixed TypeScript types for route handlers using `AuthRequest` and `Response`
  - Corrected alumni profile field from `availableForMentorship` to `isMentorAvailable`
  - Provisioned PostgreSQL database and pushed all schema tables successfully
  - Configured SMTP email service with Gmail credentials (MAIL_USERNAME, MAIL_PASSWORD)
  - Fixed database import path in `server/db.ts` to use relative path
  - Verified both frontend (port 5000) and backend (port 3001) running successfully
- **2025-10-20**: Fixed login and student data entry issues
  - Installed Python 3.11 with pip and all dependencies
  - Configured Flask backend to run on port 3002 (alongside Express on 3001)
  - Updated Vite proxy configuration to route `/api` to Flask backend (port 3002)
  - Set up concurrent workflow running all three services (Vite, Express, Flask)
  - Added Flask-Mail dependency for email functionality
  - All authentication and student data entry now working properly
- **2025-10-20**: Successfully migrated and configured complete verification system
  - Installed Drizzle ORM and Neon serverless packages
  - Created comprehensive database schema based on Supabase migrations
  - Set up Drizzle configuration and database push workflow
  - Pushed all database tables and schema to PostgreSQL (20+ tables including verification tables)
  - **Configured Gmail Email Service**: Set up permanent email credentials in Replit Secrets
  - **Admin Verification System**: Fixed and tested approve/reject workflow
  - **Email Notifications**: Automated emails sent when admin verifies users
  - **Verified Badge System**: Badge displays on verified users across the platform
  - Fixed API endpoints to use relative paths instead of hardcoded localhost URLs
  - Updated admin dashboard to properly fetch and manage verification requests
  - Populated database with sample products and events data
  - Removed Supabase dependencies and files
  - Updated Vite config to use port 5000 and added @shared path alias
  - Verified application is running successfully
- **2025-09-30**: Fresh GitHub clone setup in Replit environment
- Installed project dependencies with npm (391 packages)
- Verified Vite configuration is properly set for Replit (host 0.0.0.0, port 5000, allowedHosts: true)
- Frontend running successfully on port 5000 with proper host configuration
- Application tested and working with mock authentication system
- Deployment configured for autoscale with npm build and preview commands
- All workflows functioning correctly
- **Updated project logo**: Added custom Re-Connect circular logo to `public/reconnect-logo.png` for proper serving in both development and production
- **Previous fixes from earlier setup**:
  - Moved static images from root `attached_assets/` to `public/attached_assets/` for proper serving
  - Created `vercel.json` with client-side routing configuration to fix refresh errors
  - Removed all Lovable branding for production
  - Updated HTML meta tags (title, description, author, OpenGraph, Twitter)
  - Removed lovable-tagger plugin from Vite configuration
  - Uninstalled lovable-tagger package dependency

## User Preferences
- **Secret Management**: User prefers managing API keys and secrets manually through Replit Secrets tab rather than using automated integration connectors
- Manually configured secrets: RESEND_API_KEY (if email sending via Resend is needed), JWT_SECRET

## Project Architecture
- Single-page application with client-side routing
- Component-based architecture using React
- Type-safe development with TypeScript
- Modern development practices with ESLint and Vite