-- Remove duplicate entries, keeping only the oldest one for each user
DELETE FROM public.user_esg_points 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM public.user_esg_points 
    ORDER BY user_id, last_updated ASC
);

-- Add unique constraint on user_id
ALTER TABLE public.user_esg_points 
ADD CONSTRAINT user_esg_points_user_id_key UNIQUE (user_id);

-- Create a new version of the update_user_esg_points function that handles the table correctly
CREATE OR REPLACE FUNCTION public.update_user_esg_points(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  env_points INTEGER;
  soc_points INTEGER;
  gov_points INTEGER;
  total_calc INTEGER;
BEGIN
  -- Calculate points from transactions (esg_score * amount for expenses)
  SELECT 
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND esg_score >= 0.6 THEN (esg_score * ABS(amount))::INTEGER ELSE 0 END), 0) * 3,
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND esg_score >= 0.6 THEN (esg_score * ABS(amount))::INTEGER ELSE 0 END), 0) * 2,
    COALESCE(SUM(CASE WHEN transaction_type = 'expense' AND esg_score >= 0.6 THEN (esg_score * ABS(amount))::INTEGER ELSE 0 END), 0) * 1
  INTO env_points, soc_points, gov_points
  FROM public.transactions
  WHERE user_id = target_user_id;
  
  total_calc := env_points + soc_points + gov_points;
  
  -- Insert or update user ESG points
  INSERT INTO public.user_esg_points (
    user_id,
    environmental_points,
    social_points,
    governance_points,
    total_points,
    last_updated
  ) VALUES (
    target_user_id,
    env_points,
    soc_points,
    gov_points,
    total_calc,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    environmental_points = EXCLUDED.environmental_points,
    social_points = EXCLUDED.social_points,
    governance_points = EXCLUDED.governance_points,
    total_points = EXCLUDED.total_points,
    last_updated = NOW();
END;
$$;

-- Update ESG points for all existing users based on their transaction history
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all users who have transactions
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM public.transactions 
        WHERE user_id IS NOT NULL
    LOOP
        -- Update ESG points for each user
        PERFORM public.update_user_esg_points(user_record.user_id);
    END LOOP;
END $$;