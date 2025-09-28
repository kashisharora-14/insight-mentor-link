
-- Create career_roadmaps table
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_position TEXT NOT NULL,
  target_company TEXT,
  timeframe INTEGER NOT NULL,
  current_skills JSONB DEFAULT '[]',
  interests JSONB DEFAULT '[]',
  progress JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create roadmap_items table
CREATE TABLE IF NOT EXISTS roadmap_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('skill', 'project', 'mentorship', 'networking', 'certification', 'course')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  time_estimate TEXT,
  year INTEGER NOT NULL,
  quarter INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  prerequisites JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  alumni_mentors JSONB DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create yearly_milestones table
CREATE TABLE IF NOT EXISTS yearly_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roadmap_id UUID REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  key_skills JSONB DEFAULT '[]',
  major_projects JSONB DEFAULT '[]',
  networking_goals JSONB DEFAULT '[]',
  target_achievements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own roadmaps" ON career_roadmaps FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Users can create their own roadmaps" ON career_roadmaps FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Users can update their own roadmaps" ON career_roadmaps FOR UPDATE USING (student_id = auth.uid());
CREATE POLICY "Users can delete their own roadmaps" ON career_roadmaps FOR DELETE USING (student_id = auth.uid());

CREATE POLICY "Users can view roadmap items for their roadmaps" ON roadmap_items FOR SELECT USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can create roadmap items for their roadmaps" ON roadmap_items FOR INSERT WITH CHECK (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can update roadmap items for their roadmaps" ON roadmap_items FOR UPDATE USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can delete roadmap items for their roadmaps" ON roadmap_items FOR DELETE USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);

CREATE POLICY "Users can view milestones for their roadmaps" ON yearly_milestones FOR SELECT USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can create milestones for their roadmaps" ON yearly_milestones FOR INSERT WITH CHECK (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can update milestones for their roadmaps" ON yearly_milestones FOR UPDATE USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);
CREATE POLICY "Users can delete milestones for their roadmaps" ON yearly_milestones FOR DELETE USING (
  roadmap_id IN (SELECT id FROM career_roadmaps WHERE student_id = auth.uid())
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_career_roadmaps_updated_at BEFORE UPDATE ON career_roadmaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
