-- Ensure optional text columns exist on mentorship_requests
ALTER TABLE mentorship_requests
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS goals text,
  ADD COLUMN IF NOT EXISTS preferred_time text;
