-- Create a demo admin user (you'll need to sign up first, then run this)
-- This script sets up an existing user as an admin

-- First, find your user ID by running:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then update the user_id below with your actual ID and run this script:
-- Example: UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID_HERE';

-- For quick testing, here's how to set up the first admin:
-- 1. Sign up with email: admin@aicser.ai and password: Admin123!@
-- 2. Find the user ID from Supabase dashboard
-- 3. Run: UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@aicser.ai';

-- You can also create multiple demo users:
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@aicser.ai',
  crypt('Admin123!@', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin User"}',
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- Set the user as admin in profiles
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@aicser.ai';
