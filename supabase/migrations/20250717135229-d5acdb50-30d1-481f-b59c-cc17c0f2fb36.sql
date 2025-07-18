-- Fix the handle_new_user function to remove reference to non-existent member_since column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email
  );
  
  -- Generate a digital ID
  UPDATE public.profiles 
  SET digital_id = 'MY' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000000)::TEXT, 10, '0')
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$function$;