-- Create a policy to allow profile lookup by phone/digital_id for authentication
CREATE POLICY "Allow profile lookup for authentication"
ON public.profiles
FOR SELECT
TO anon
USING (true);