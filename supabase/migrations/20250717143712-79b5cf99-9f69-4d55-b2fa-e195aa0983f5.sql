-- Drop existing INSERT policy for merchant_profiles
DROP POLICY IF EXISTS "Users can create their own merchant profile" ON public.merchant_profiles;

-- Create new INSERT policy that also allows service role
CREATE POLICY "Users can create their own merchant profile" 
ON public.merchant_profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR auth.role() = 'service_role'
  OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);