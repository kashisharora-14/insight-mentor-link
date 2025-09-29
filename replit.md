# Alumni Platform - Replit Project Setup

## Project Overview
This is a React + TypeScript alumni platform application with Supabase integration. The project was successfully imported from GitHub and configured to run in the Replit environment.

## Key Features
- React 18 with TypeScript
- Vite for development and build tooling
- Supabase for backend services
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
- **Authentication**: Supabase Auth (currently using mock auth for demo)
- **Database**: Supabase PostgreSQL
- **Build Tool**: Vite
- **Package Manager**: npm

## Project Structure
- `/src` - Main application source code
  - `/components` - Reusable UI components
  - `/pages` - Application pages/routes
  - `/contexts` - React contexts (AuthContext)
  - `/integrations` - External service integrations (Supabase)
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions
- `/public` - Static assets
- `/supabase` - Supabase configuration and migrations

## Environment Configuration
The application uses environment variables for Supabase configuration:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public API key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

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
- **2025-09-29**: Successful GitHub import and Replit environment setup completed
- Installed project dependencies with npm (400 packages)
- Verified Vite configuration is properly set for Replit (host 0.0.0.0, port 5000, allowedHosts: true)
- Frontend running successfully on port 5000 with proper host configuration
- Application tested and working with mock authentication system
- Deployment configured for autoscale with npm build and preview commands
- All workflows functioning correctly

## User Preferences
- No specific preferences documented yet

## Project Architecture
- Single-page application with client-side routing
- Component-based architecture using React
- Type-safe development with TypeScript
- Modern development practices with ESLint and Vite