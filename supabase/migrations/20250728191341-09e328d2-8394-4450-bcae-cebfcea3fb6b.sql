-- Adicionar constraint UNIQUE no email da tabela profiles para evitar múltiplos acessos
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Atualizar a função para lidar com possíveis conflitos de email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Inserir perfil apenas se o email não existir
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$$;