-- Update the demo user profile with a valid email address
UPDATE public.profiles 
SET email = 'demo.mydigitalid@gmail.com'
WHERE digital_id = 'MY2024567890';

-- Since we can't directly insert into auth.users, we'll just update the profile
-- The auth user will be created when they first sign up through the UI