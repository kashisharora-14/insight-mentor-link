-- Migration: add chat close columns to mentorship_requests
-- Up
ALTER TABLE mentorship_requests
  ADD COLUMN IF NOT EXISTS chat_closed_reason TEXT,
  ADD COLUMN IF NOT EXISTS chat_closed_at TIMESTAMPTZ;

-- Down (manual)
-- ALTER TABLE mentorship_requests
--   DROP COLUMN IF EXISTS chat_closed_reason,
--   DROP COLUMN IF EXISTS chat_closed_at;
