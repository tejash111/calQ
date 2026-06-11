-- SQL Schema for calQ Database Tables

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g. user_...)
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the onboarding table
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal TEXT,
  gender TEXT,
  weight TEXT,
  height TEXT,
  birth_day TEXT,
  birth_month TEXT,
  birth_year TEXT,
  desired_weight TEXT,
  activity_level TEXT,
  pace TEXT,
  connect_fit BOOLEAN DEFAULT false,
  daily_calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- 4. Set up simple RLS Policies for Anon client usage
-- (Note: Since we are using standard anon keys, we allow select, insert, and update operations)
CREATE POLICY "Allow public select on users" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on users" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on users" ON public.users
  FOR UPDATE USING (true);

CREATE POLICY "Allow public select on onboarding" ON public.onboarding
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on onboarding" ON public.onboarding
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on onboarding" ON public.onboarding
  FOR UPDATE USING (true);
