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
- `/server` - Backend server code
  - `db.ts` - Database connection and Drizzle setup
- `/shared` - Shared code between frontend and backend
  - `schema.ts` - Drizzle ORM database schema definitions
- `/public` - Static assets
- `/backend` - Flask backend (existing, for Python-based APIs)

## Database Schema
The database includes the following tables:
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
The application uses the following environment variables (automatically configured by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port
- `PGDATABASE` - Database name
- `PGUSER` - Database user
- `PGPASSWORD` - Database password

## Database Commands
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Development Setup
- **Port**: 5000 (configured for Replit)
- **Host**: 0.0.0.0 (allows external access)
- **Development Server**: Vite dev server
- **Hot Reload**: Enabled

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
- **2025-10-20**: Successfully migrated from Supabase to Replit Neon PostgreSQL
  - Installed Drizzle ORM and Neon serverless packages
  - Created comprehensive database schema based on Supabase migrations
  - Set up Drizzle configuration and database push workflow
  - Pushed all database tables and schema to PostgreSQL
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
- No specific preferences documented yet

## Project Architecture
- Single-page application with client-side routing
- Component-based architecture using React
- Type-safe development with TypeScript
- Modern development practices with ESLint and Vite