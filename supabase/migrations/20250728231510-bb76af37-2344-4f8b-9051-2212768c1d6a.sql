-- Update the RLS policy to include teste@gmail.com as admin
DROP POLICY IF EXISTS "Only admins can modify system configurations" ON public.system_configurations;

CREATE POLICY "Only admins can modify system configurations" 
ON public.system_configurations 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com', 'teste@gmail.com')
);