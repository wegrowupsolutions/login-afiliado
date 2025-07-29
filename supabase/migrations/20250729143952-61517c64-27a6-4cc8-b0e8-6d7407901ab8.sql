-- Fix remaining security issues

-- 1. Fix functions that still need search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_codigo_afiliado()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    codigo TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Gerar código alfanumérico de 8 caracteres
        codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Verificar se já existe
        SELECT EXISTS(SELECT 1 FROM public.afiliados_perfis WHERE codigo_afiliado = codigo) INTO existe;
        
        EXIT WHEN NOT existe;
    END LOOP;
    
    RETURN codigo;
END;
$$;

CREATE OR REPLACE FUNCTION public.atualizar_contador_cadastros()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.afiliado_id IS NOT NULL THEN
        UPDATE public.afiliados_perfis 
        SET total_cadastros = total_cadastros + 1,
            updated_at = now()
        WHERE id = NEW.afiliado_id;
    ELSIF TG_OP = 'DELETE' AND OLD.afiliado_id IS NOT NULL THEN
        UPDATE public.afiliados_perfis 
        SET total_cadastros = GREATEST(total_cadastros - 1, 0),
            updated_at = now()
        WHERE id = OLD.afiliado_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Update handle_new_user function to use proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Inserir perfil apenas se o email não existir
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$;