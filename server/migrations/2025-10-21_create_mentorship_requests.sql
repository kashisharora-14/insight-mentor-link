-- Migration: create mentorship_requests table if missing
-- Up
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES profiles(user_id) ON DELETE SET NULL,
  field_of_interest text NOT NULL,
  description text,
  goals text,
  preferred_time text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  chat_closed_reason text,
  chat_closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_mentorship_requests_student ON mentorship_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_requests_mentor ON mentorship_requests(mentor_id);

-- Down (manual)
-- DROP TABLE IF EXISTS mentorship_requests;
