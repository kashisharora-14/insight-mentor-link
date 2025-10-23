-- Migration: add goals and preferred_time columns to mentorship_requests
-- Up
ALTER TABLE mentorship_requests
  ADD COLUMN IF NOT EXISTS goals TEXT,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT;

-- Down (manual)
-- ALTER TABLE mentorship_requests
--   DROP COLUMN IF EXISTS goals,
--   DROP COLUMN IF EXISTS preferred_time;
