-- Insert dummy MyDigital ID user data
-- First, let's insert a user into auth.users (this would normally be handled by Supabase Auth)
-- We'll create a profile that can be used for demo purposes

-- Insert a demo profile for MyDigital ID login
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  digital_id,
  phone,
  is_verified,
  esg_score,
  esg_level,
  total_transactions,
  total_spent,
  member_since
) VALUES (
  '2614e7ca-9298-4431-9f04-66515b6267f7'::uuid,
  'Demo User (MyDigital ID)',
  'demo@mydigitalid.gov.my',
  'MY2024567890',
  '+60123456789',
  true,
  85,
  'Excellent',
  15,
  2450.75,
  '2023-01-15'
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  digital_id = EXCLUDED.digital_id,
  phone = EXCLUDED.phone,
  is_verified = EXCLUDED.is_verified,
  esg_score = EXCLUDED.esg_score,
  esg_level = EXCLUDED.esg_level,
  total_transactions = EXCLUDED.total_transactions,
  total_spent = EXCLUDED.total_spent,
  member_since = EXCLUDED.member_since;

-- Insert some sample transactions for the demo user
INSERT INTO public.transactions (
  user_id,
  title,
  description,
  amount,
  transaction_type,
  merchant_name,
  location,
  esg_score,
  status,
  currency,
  created_at
) VALUES 
(
  '2614e7ca-9298-4431-9f04-66515b6267f7'::uuid,
  'Eco-Friendly Groceries',
  'Weekly grocery shopping at organic market',
  -125.50,
  'expense',
  'Green Valley Market',
  'Kuala Lumpur, Malaysia',
  0.95,
  'completed',
  'MYR',
  NOW() - INTERVAL '2 days'
),
(
  '2614e7ca-9298-4431-9f04-66515b6267f7'::uuid,
  'Solar Panel Installation',
  'Investment in renewable energy',
  -2500.00,
  'expense',
  'SolarTech Malaysia',
  'Petaling Jaya, Malaysia',
  1.0,
  'completed',
  'MYR',
  NOW() - INTERVAL '1 week'
),
(
  '2614e7ca-9298-4431-9f04-66515b6267f7'::uuid,
  'Public Transport',
  'LRT train ride to work',
  -3.20,
  'expense',
  'RapidKL',
  'Kuala Lumpur, Malaysia',
  0.90,
  'completed',
  'MYR',
  NOW() - INTERVAL '1 day'
);

-- Insert ESG metrics for the demo user
INSERT INTO public.esg_metrics (
  user_id,
  period_start,
  period_end,
  environmental_score,
  social_score,
  governance_score,
  overall_score,
  carbon_footprint,
  sustainable_spending,
  total_spending
) VALUES (
  '2614e7ca-9298-4431-9f04-66515b6267f7'::uuid,
  '2024-07-01'::date,
  '2024-07-31'::date,
  0.90,
  0.85,
  0.80,
  0.85,
  1.2,
  1890.50,
  2450.75
) ON CONFLICT DO NOTHING;