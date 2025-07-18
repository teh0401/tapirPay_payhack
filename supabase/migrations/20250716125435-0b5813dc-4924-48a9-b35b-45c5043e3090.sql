-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table for transaction categorization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  esg_impact DECIMAL(3,2) DEFAULT 0, -- ESG impact score (-1 to 1)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  transaction_type TEXT CHECK (transaction_type IN ('income', 'expense')) NOT NULL,
  status TEXT CHECK (status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
  merchant_name TEXT,
  location TEXT,
  tags TEXT[],
  esg_score DECIMAL(3,2) DEFAULT 0, -- Individual transaction ESG score
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG metrics table for tracking overall ESG performance
CREATE TABLE public.esg_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  environmental_score DECIMAL(3,2) DEFAULT 0,
  social_score DECIMAL(3,2) DEFAULT 0,
  governance_score DECIMAL(3,2) DEFAULT 0,
  overall_score DECIMAL(3,2) DEFAULT 0,
  carbon_footprint DECIMAL(10,2) DEFAULT 0, -- kg CO2
  sustainable_spending DECIMAL(10,2) DEFAULT 0,
  total_spending DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for categories (viewable by all authenticated users)
CREATE POLICY "Categories are viewable by authenticated users" 
ON public.categories FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" 
ON public.transactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON public.transactions FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for ESG metrics
CREATE POLICY "Users can view their own ESG metrics" 
ON public.esg_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ESG metrics" 
ON public.esg_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ESG metrics" 
ON public.esg_metrics FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, icon, color, esg_impact) VALUES
('Food & Dining', '🍽️', '#FF6B35', 0.2),
('Transportation', '🚗', '#4ECDC4', -0.3),
('Shopping', '🛍️', '#45B7D1', -0.1),
('Utilities', '⚡', '#96CEB4', 0.1),
('Healthcare', '🏥', '#FFEAA7', 0.5),
('Education', '📚', '#DDA0DD', 0.8),
('Entertainment', '🎬', '#FFB6C1', 0.0),
('Travel', '✈️', '#87CEEB', -0.4),
('Groceries', '🛒', '#98D8C8', 0.3),
('Sustainable Products', '🌱', '#6ECB63', 0.9),
('Renewable Energy', '🔋', '#4FFFB0', 1.0),
('Local Business', '🏪', '#FFD93D', 0.6);

-- Insert sample transactions (dummy data)
INSERT INTO public.transactions (user_id, category_id, title, description, amount, transaction_type, status, merchant_name, location, tags, esg_score, created_at) VALUES
-- Note: user_id will need to be updated with actual auth user IDs when users sign up
-- For now using placeholder UUIDs that can be updated
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Groceries'), 'Organic vegetables', 'Fresh organic produce from local farm', -25.50, 'expense', 'completed', 'Green Farm Market', 'Kuala Lumpur', ARRAY['organic', 'local'], 0.8, now() - interval '1 day'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Local Business'), 'Traditional crafts', 'Handmade items from local artisans', 150.00, 'income', 'completed', 'Cultural Handicrafts', 'Penang', ARRAY['handmade', 'cultural'], 0.7, now() - interval '2 days'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Sustainable Products'), 'Fair trade coffee', 'Ethically sourced coffee beans', -8.75, 'expense', 'pending', 'Local Coffee Roaster', 'Johor Bahru', ARRAY['fair-trade', 'organic'], 0.9, now() - interval '3 hours'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Transportation'), 'Electric vehicle charging', 'EV charging station payment', -15.00, 'expense', 'completed', 'ChargEV Station', 'Selangor', ARRAY['electric', 'clean-energy'], 0.8, now() - interval '5 days'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Renewable Energy'), 'Solar panel maintenance', 'Monthly solar system check', -120.00, 'expense', 'completed', 'GreenTech Solutions', 'Kuala Lumpur', ARRAY['renewable', 'maintenance'], 1.0, now() - interval '1 week'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Food & Dining'), 'Vegetarian restaurant', 'Plant-based dinner', -42.30, 'expense', 'completed', 'Green Garden Cafe', 'Selangor', ARRAY['vegetarian', 'sustainable'], 0.6, now() - interval '3 days'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Education'), 'ESG Workshop', 'Sustainability training course', -89.00, 'expense', 'completed', 'EcoLearning Institute', 'Kuala Lumpur', ARRAY['education', 'sustainability'], 0.9, now() - interval '1 week'),
('00000000-0000-0000-0000-000000000000', (SELECT id FROM categories WHERE name = 'Shopping'), 'Eco-friendly products', 'Bamboo household items', -67.80, 'expense', 'completed', 'Sustainable Living Store', 'Penang', ARRAY['eco-friendly', 'bamboo'], 0.8, now() - interval '4 days');

-- Insert sample ESG metrics
INSERT INTO public.esg_metrics (user_id, period_start, period_end, environmental_score, social_score, governance_score, overall_score, carbon_footprint, sustainable_spending, total_spending) VALUES
('00000000-0000-0000-0000-000000000000', date_trunc('month', current_date), current_date, 0.75, 0.68, 0.82, 0.75, 125.5, 285.35, 518.35),
('00000000-0000-0000-0000-000000000000', date_trunc('month', current_date - interval '1 month'), date_trunc('month', current_date) - interval '1 day', 0.72, 0.65, 0.79, 0.72, 142.3, 312.40, 645.20);