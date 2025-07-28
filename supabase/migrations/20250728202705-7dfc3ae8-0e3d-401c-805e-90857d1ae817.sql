-- Corrigir security warnings das funções criadas
-- Definindo search_path para as funções de role

-- Recriar função has_role com search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Recriar função is_admin com search_path
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Recriar função assign_admin_to_specific_emails com search_path
CREATE OR REPLACE FUNCTION public.assign_admin_to_specific_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Inserir role de admin para os emails especificados
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'admin'::app_role
    FROM auth.users au
    WHERE au.email IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com')
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Recriar função auto_assign_admin_role com search_path
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Se o email está na lista de admins, inserir role de admin
    IF NEW.email IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        -- Para outros usuários, inserir role padrão de 'user'
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;