-- Phase 1: Critical Security Fixes

-- 1. Create admin_emails configuration in system_configurations
INSERT INTO public.system_configurations (key, value, description)
VALUES 
  ('admin_emails', 'viniciushtx@gmail.com,rfreitasdc@gmail.com,teste@gmail.com', 'Comma-separated list of admin email addresses')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;

-- 2. Create secure function to get admin emails
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS TEXT[] AS $$
DECLARE
  admin_emails_str TEXT;
BEGIN
  SELECT value INTO admin_emails_str 
  FROM public.system_configurations 
  WHERE key = 'admin_emails';
  
  IF admin_emails_str IS NULL THEN
    RETURN ARRAY[]::TEXT[];
  END IF;
  
  RETURN string_to_array(admin_emails_str, ',');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';

-- 3. Create secure function to check if user is admin by email
CREATE OR REPLACE FUNCTION public.is_admin_email(email_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN email_to_check = ANY(public.get_admin_emails());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path TO 'public';

-- 4. Update auto_assign_admin_role function with proper security
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Use secure function to check admin emails
    IF public.is_admin_email(NEW.email) THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        -- For other users, insert default 'user' role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. Update assign_admin_to_specific_emails function with proper security
CREATE OR REPLACE FUNCTION public.assign_admin_to_specific_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Use secure function to get admin emails
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'admin'::app_role
    FROM auth.users au
    WHERE public.is_admin_email(au.email)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- 6. Update system_configurations RLS policy to use secure function
DROP POLICY IF EXISTS "Only admins can modify system configurations" ON public.system_configurations;

CREATE POLICY "Only admins can modify system configurations" 
ON public.system_configurations 
FOR ALL 
USING (public.is_admin_email((auth.jwt() ->> 'email'::text)));

-- 7. Add proper search_path to existing functions
CREATE OR REPLACE FUNCTION public.cleanup_inactive_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE last_activity < (now() - interval '24 hours')
    AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.invalidate_previous_sessions(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE user_id = user_uuid
    AND is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.evolution_instances (
    user_id, 
    instance_name, 
    phone_number, 
    is_connected, 
    connected_at
  )
  VALUES (
    p_user_id, 
    p_instance_name, 
    p_phone_number, 
    true, 
    now()
  )
  ON CONFLICT (user_id, instance_name) 
  DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL,
    updated_at = now();
END;
$$;