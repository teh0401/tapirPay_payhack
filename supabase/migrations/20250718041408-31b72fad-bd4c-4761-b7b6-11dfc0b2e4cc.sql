-- Update the handle_new_user function to also store IC number and phone number
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, digital_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'ic_number'
  );
  
  -- Generate a digital ID only if IC number wasn't provided
  IF NEW.raw_user_meta_data->>'ic_number' IS NULL THEN
    UPDATE public.profiles 
    SET digital_id = 'MY' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000000)::TEXT, 10, '0')
    WHERE user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;