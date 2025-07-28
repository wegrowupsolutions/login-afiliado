-- Criar tabela para controlar sessões ativas
CREATE TABLE public.active_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL UNIQUE,
  device_info jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now(),
  last_activity timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Habilitar RLS na tabela active_sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias sessões
CREATE POLICY "Users can view their own sessions" 
ON public.active_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para que usuários possam inserir suas próprias sessões
CREATE POLICY "Users can create their own sessions" 
ON public.active_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para que usuários possam atualizar suas próprias sessões
CREATE POLICY "Users can update their own sessions" 
ON public.active_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Política para que usuários possam deletar suas próprias sessões
CREATE POLICY "Users can delete their own sessions" 
ON public.active_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para limpar sessões inativas (mais de 24 horas)
CREATE OR REPLACE FUNCTION public.cleanup_inactive_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE last_activity < (now() - interval '24 hours')
    AND is_active = true;
END;
$$;

-- Função para invalidar todas as sessões anteriores de um usuário
CREATE OR REPLACE FUNCTION public.invalidate_previous_sessions(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE user_id = user_uuid
    AND is_active = true;
END;
$$;