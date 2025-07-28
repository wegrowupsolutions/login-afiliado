-- Atualizar função auto_assign_admin_role para incluir teste@gmail.com
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Se o email está na lista de admins, inserir role de admin
    IF NEW.email IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com', 'teste@gmail.com') THEN
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

-- Atualizar função assign_admin_to_specific_emails para incluir teste@gmail.com
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
    WHERE au.email IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com', 'teste@gmail.com')
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Executar função para atribuir admin aos usuários existentes (incluindo teste@gmail.com se já existir)
SELECT public.assign_admin_to_specific_emails();