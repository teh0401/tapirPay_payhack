-- Create function to update user ESG points from transactions
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

-- Create function to redeem points
CREATE OR REPLACE FUNCTION public.redeem_esg_points(target_user_id uuid, points_to_redeem integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Get current total points
  SELECT total_points INTO current_points
  FROM public.user_esg_points
  WHERE user_id = target_user_id;
  
  -- Check if user has enough points
  IF current_points IS NULL OR current_points < points_to_redeem THEN
    RETURN false;
  END IF;
  
  -- Deduct points proportionally from each category
  UPDATE public.user_esg_points
  SET 
    environmental_points = GREATEST(0, environmental_points - (points_to_redeem * environmental_points / NULLIF(total_points, 0))::INTEGER),
    social_points = GREATEST(0, social_points - (points_to_redeem * social_points / NULLIF(total_points, 0))::INTEGER),
    governance_points = GREATEST(0, governance_points - (points_to_redeem * governance_points / NULLIF(total_points, 0))::INTEGER),
    total_points = total_points - points_to_redeem,
    last_updated = NOW()
  WHERE user_id = target_user_id;
  
  RETURN true;
END;
$$;