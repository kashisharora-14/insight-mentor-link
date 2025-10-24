
-- Migration: Add missing jobs columns and job_referral_requests table
-- Up

-- Add missing column to jobs table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS posted_by_role TEXT;

-- Create job_referral_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_referral_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  alumni_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  message TEXT,
  resume_url TEXT,
  response_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index to prevent duplicate requests
CREATE UNIQUE INDEX IF NOT EXISTS job_student_unique 
ON job_referral_requests(job_id, student_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_referral_requests_job 
ON job_referral_requests(job_id);

CREATE INDEX IF NOT EXISTS idx_job_referral_requests_student 
ON job_referral_requests(student_id);

CREATE INDEX IF NOT EXISTS idx_job_referral_requests_alumni 
ON job_referral_requests(alumni_id);
