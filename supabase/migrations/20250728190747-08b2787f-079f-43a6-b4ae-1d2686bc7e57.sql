-- Verificar se já existe trigger para criação automática de perfil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Atualizar a função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Criar o trigger para executar a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar perfil para o usuário atual se não existir
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823',
  'teste@gmail.com',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'
);