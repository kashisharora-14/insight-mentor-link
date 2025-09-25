-- Create profiles table for alumni and students
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'alumni', 'admin')),
  graduation_year INTEGER,
  department TEXT,
  current_job TEXT,
  company TEXT,
  skills TEXT[],
  linkedin_profile TEXT,
  phone TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_mentor_available BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_requests table
CREATE TABLE public.mentorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  field_of_interest TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentorship_sessions table
CREATE TABLE public.mentorship_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_request_id UUID NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  skills_discussed TEXT[],
  next_session_plan TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for mentor-mentee communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_request_id UUID NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for mentorship_requests
CREATE POLICY "Users can view mentorship requests they're involved in" ON public.mentorship_requests 
FOR SELECT USING (student_id = auth.uid() OR mentor_id = auth.uid());
CREATE POLICY "Students can create mentorship requests" ON public.mentorship_requests 
FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Mentors and students can update their requests" ON public.mentorship_requests 
FOR UPDATE USING (student_id = auth.uid() OR mentor_id = auth.uid());

-- RLS Policies for mentorship_sessions
CREATE POLICY "Users can view sessions for their mentorships" ON public.mentorship_sessions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_requests 
    WHERE id = mentorship_request_id 
    AND (student_id = auth.uid() OR mentor_id = auth.uid())
  )
);
CREATE POLICY "Users can create sessions for their mentorships" ON public.mentorship_sessions 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.mentorship_requests 
    WHERE id = mentorship_request_id 
    AND (student_id = auth.uid() OR mentor_id = auth.uid())
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their mentorships" ON public.messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_requests 
    WHERE id = mentorship_request_id 
    AND (student_id = auth.uid() OR mentor_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages for their mentorships" ON public.messages 
FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.mentorship_requests 
    WHERE id = mentorship_request_id 
    AND (student_id = auth.uid() OR mentor_id = auth.uid())
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorship_requests_updated_at
  BEFORE UPDATE ON public.mentorship_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();