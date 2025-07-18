-- Add esg_score column to profiles table to store the user's ESG score
ALTER TABLE public.profiles 
ADD COLUMN esg_score INTEGER DEFAULT 0;

-- Update existing profiles with their ESG scores from esg_metrics
UPDATE public.profiles 
SET esg_score = COALESCE((
  SELECT ROUND(overall_score * 100)::INTEGER 
  FROM public.esg_metrics 
  WHERE esg_metrics.user_id = profiles.user_id 
  ORDER BY created_at DESC 
  LIMIT 1
), 0);