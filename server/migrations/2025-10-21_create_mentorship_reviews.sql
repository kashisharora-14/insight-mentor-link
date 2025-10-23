-- Migration: create mentorship_reviews table
-- Up
CREATE TABLE IF NOT EXISTS mentorship_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_request_id uuid NOT NULL REFERENCES mentorship_requests(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT review_unique_per_request UNIQUE (mentorship_request_id, reviewer_id)
);

-- Down (manual)
-- DROP TABLE IF EXISTS mentorship_reviews;
