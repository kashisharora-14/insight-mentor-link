
-- Create success stories table
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  batch TEXT NOT NULL,
  program TEXT NOT NULL,
  achievement TEXT NOT NULL,
  description TEXT NOT NULL,
  current_position TEXT NOT NULL,
  company TEXT NOT NULL,
  image_url TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_success_stories_created_at ON success_stories(created_at DESC);
