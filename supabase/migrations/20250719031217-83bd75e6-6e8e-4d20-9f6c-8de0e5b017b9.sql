-- Remove duplicate entries, keeping only the oldest one for each user
DELETE FROM public.user_esg_points 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM public.user_esg_points 
    GROUP BY user_id
);

-- Add unique constraint on user_id
ALTER TABLE public.user_esg_points 
ADD CONSTRAINT user_esg_points_user_id_key UNIQUE (user_id);

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