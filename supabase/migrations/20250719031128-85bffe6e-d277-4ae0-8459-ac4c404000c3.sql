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