-- Update profiles table to include additional fields from the profile page
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS esg_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS esg_level TEXT DEFAULT 'Beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS digital_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_since DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_transactions INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0;

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, member_since)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    CURRENT_DATE
  );
  
  -- Generate a digital ID
  UPDATE public.profiles 
  SET digital_id = 'MY' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000000)::TEXT, 10, '0')
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION public.update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  user_total_transactions INTEGER;
  user_total_spent DECIMAL(10,2);
  user_avg_esg_score DECIMAL(3,2);
  user_esg_level TEXT;
BEGIN
  -- Calculate user statistics
  SELECT 
    COUNT(*),
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' THEN ABS(amount) ELSE 0 END), 0),
    COALESCE(AVG(esg_score), 0)
  INTO user_total_transactions, user_total_spent, user_avg_esg_score
  FROM public.transactions
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  -- Determine ESG level based on average score
  IF user_avg_esg_score >= 0.8 THEN
    user_esg_level := 'Excellent';
  ELSIF user_avg_esg_score >= 0.6 THEN
    user_esg_level := 'Good';
  ELSIF user_avg_esg_score >= 0.4 THEN
    user_esg_level := 'Fair';
  ELSE
    user_esg_level := 'Beginner';
  END IF;
  
  -- Update profile with new statistics
  UPDATE public.profiles
  SET 
    total_transactions = user_total_transactions,
    total_spent = user_total_spent,
    esg_score = (user_avg_esg_score * 100)::INTEGER,
    esg_level = user_esg_level
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update user stats when transactions change
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats();

-- Insert sample profile for demo user
INSERT INTO public.profiles (
  user_id, 
  full_name, 
  email, 
  phone, 
  esg_score, 
  esg_level, 
  digital_id, 
  is_verified, 
  member_since,
  total_transactions,
  total_spent
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Ming En',
  'mingen@example.com',
  '+60 12-345 6789',
  85,
  'Excellent',
  'MY1234567890',
  true,
  '2024-01-15',
  42,
  1250.75
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  esg_score = EXCLUDED.esg_score,
  esg_level = EXCLUDED.esg_level,
  digital_id = EXCLUDED.digital_id,
  is_verified = EXCLUDED.is_verified,
  member_since = EXCLUDED.member_since,
  total_transactions = EXCLUDED.total_transactions,
  total_spent = EXCLUDED.total_spent;