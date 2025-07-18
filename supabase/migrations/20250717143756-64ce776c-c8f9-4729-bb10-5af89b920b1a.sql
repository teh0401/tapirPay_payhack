-- Drop the current policy
DROP POLICY IF EXISTS "Users can create their own merchant profile" ON public.merchant_profiles;

-- Create a more permissive policy that allows authenticated users to create profiles
CREATE POLICY "Users can create their own merchant profile" 
ON public.merchant_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (true);