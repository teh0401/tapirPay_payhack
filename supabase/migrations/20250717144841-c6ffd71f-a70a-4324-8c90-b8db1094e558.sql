-- Create ESG Tags table
CREATE TABLE public.esg_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Environmental', 'Social', 'Governance')),
  score_weight INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Merchant ESG Tags table (many-to-many relationship)
CREATE TABLE public.merchant_esg_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.esg_tags(id) ON DELETE CASCADE,
  is_auto_assigned BOOLEAN NOT NULL DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(merchant_id, tag_id)
);

-- Create User ESG Points table to track buyer impact
CREATE TABLE public.user_esg_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  environmental_points INTEGER NOT NULL DEFAULT 0,
  social_points INTEGER NOT NULL DEFAULT 0,
  governance_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ESG Transactions table to track impact purchases
CREATE TABLE public.esg_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(id),
  transaction_amount DECIMAL(10,2) NOT NULL,
  environmental_points_earned INTEGER NOT NULL DEFAULT 0,
  social_points_earned INTEGER NOT NULL DEFAULT 0,
  governance_points_earned INTEGER NOT NULL DEFAULT 0,
  total_points_earned INTEGER NOT NULL DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_synced BOOLEAN NOT NULL DEFAULT false
);

-- Create Merchant Incentives table
CREATE TABLE public.merchant_incentives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES public.merchant_profiles(id) ON DELETE CASCADE,
  total_impact_transactions INTEGER NOT NULL DEFAULT 0,
  discount_rate DECIMAL(5,2) NOT NULL DEFAULT 2.5,
  has_esg_badge BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add business_description to merchant_profiles
ALTER TABLE public.merchant_profiles 
ADD COLUMN business_description TEXT,
ADD COLUMN environmental_score INTEGER DEFAULT 0,
ADD COLUMN social_score INTEGER DEFAULT 0,
ADD COLUMN governance_score INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.esg_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_esg_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_esg_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esg_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_incentives ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for esg_tags (viewable by all authenticated users)
CREATE POLICY "ESG tags are viewable by authenticated users" 
ON public.esg_tags 
FOR SELECT 
USING (auth.role() = 'authenticated'::text);

-- Create RLS policies for merchant_esg_tags
CREATE POLICY "Users can view their merchant's ESG tags" 
ON public.merchant_esg_tags 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles 
    WHERE id = merchant_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their merchant's ESG tags" 
ON public.merchant_esg_tags 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles 
    WHERE id = merchant_id AND user_id = auth.uid()
  )
);

-- Create RLS policies for user_esg_points
CREATE POLICY "Users can view their own ESG points" 
ON public.user_esg_points 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own ESG points" 
ON public.user_esg_points 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for esg_transactions
CREATE POLICY "Users can view their ESG transactions" 
ON public.esg_transactions 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create ESG transactions" 
ON public.esg_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Create RLS policies for merchant_incentives
CREATE POLICY "Users can view their merchant incentives" 
ON public.merchant_incentives 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.merchant_profiles 
    WHERE id = merchant_id AND user_id = auth.uid()
  )
);

-- Insert default ESG tags
INSERT INTO public.esg_tags (name, category, score_weight, description) VALUES
('Local Business', 'Social', 15, 'Supports local economy and community'),
('Eco-Friendly', 'Environmental', 20, 'Uses sustainable practices and materials'),
('Women-Led', 'Social', 15, 'Owned or led by women'),
('Fair Trade', 'Social', 18, 'Ensures fair wages and working conditions'),
('Recycled Materials', 'Environmental', 16, 'Uses recycled or upcycled materials'),
('Carbon Neutral', 'Environmental', 25, 'Commits to carbon neutrality'),
('Community Support', 'Social', 12, 'Actively supports local community initiatives'),
('Ethical Sourcing', 'Governance', 18, 'Sources materials ethically and transparently'),
('Diversity & Inclusion', 'Social', 14, 'Promotes diversity and inclusion'),
('Renewable Energy', 'Environmental', 22, 'Uses renewable energy sources'),
('Transparent Practices', 'Governance', 16, 'Maintains transparent business practices'),
('Minority-Owned', 'Social', 15, 'Owned by minority entrepreneurs'),
('Organic Products', 'Environmental', 18, 'Offers organic or chemical-free products'),
('Zero Waste', 'Environmental', 20, 'Implements zero waste practices'),
('Employee Wellness', 'Social', 12, 'Prioritizes employee health and wellness'),
('B-Corp Certified', 'Governance', 25, 'Certified Benefit Corporation'),
('Philanthropic', 'Social', 13, 'Regularly donates to charitable causes'),
('Sustainable Packaging', 'Environmental', 15, 'Uses sustainable packaging materials'),
('Local Sourcing', 'Environmental', 14, 'Sources materials locally to reduce carbon footprint'),
('Ethical Leadership', 'Governance', 17, 'Demonstrates ethical leadership and governance');

-- Create triggers for updated_at columns
CREATE TRIGGER update_merchant_incentives_updated_at
  BEFORE UPDATE ON public.merchant_incentives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_esg_points_updated_at
  BEFORE UPDATE ON public.user_esg_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();