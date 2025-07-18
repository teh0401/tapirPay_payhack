-- Insert demo profile for user 00000000-0000-0000-0000-000000000000
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
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Teh',
  'teh@mydigitalid.gov.my',
  'MY2024000000',
  '+60123456789',
  true,
  90,
  'Excellent',
  12,
  1850.25,
  '2023-06-01'
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

-- Insert some sample transactions for user 00000000-0000-0000-0000-000000000000
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
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Sustainable Food Purchase',
  'Local organic vegetables',
  -85.50,
  'expense',
  'Teh Organic Farm',
  'Penang, Malaysia',
  0.98,
  'completed',
  'MYR',
  NOW() - INTERVAL '1 day'
),
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Electric Vehicle Charging',
  'EV charging at sustainable station',
  -15.00,
  'expense',
  'GreenCharge Malaysia',
  'Kuala Lumpur, Malaysia',
  1.0,
  'completed',
  'MYR',
  NOW() - INTERVAL '3 days'
),
(
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Renewable Energy Investment',
  'Solar panel subscription',
  -200.00,
  'expense',
  'SolarTech KL',
  'Kuala Lumpur, Malaysia',
  1.0,
  'completed',
  'MYR',
  NOW() - INTERVAL '1 week'
) ON CONFLICT DO NOTHING;

-- Insert ESG metrics for user 00000000-0000-0000-0000-000000000000
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
  '00000000-0000-0000-0000-000000000000'::uuid,
  '2024-07-01'::date,
  '2024-07-31'::date,
  0.95,
  0.88,
  0.85,
  0.90,
  0.8,
  1650.25,
  1850.25
) ON CONFLICT DO NOTHING;