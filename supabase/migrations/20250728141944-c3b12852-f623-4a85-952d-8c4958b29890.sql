-- Primeiro, vamos adicionar uma coluna user_id às tabelas que não têm
-- e corrigir as políticas RLS para garantir isolamento de dados por usuário

-- 1. Adicionar user_id à tabela dados_cliente se não existir
ALTER TABLE public.dados_cliente 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Adicionar user_id à tabela documents se não existir  
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Adicionar user_id à tabela n8n_chat_histories se não existir
ALTER TABLE public.n8n_chat_histories
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Remover políticas RLS inseguras existentes
DROP POLICY IF EXISTS "Allow all operations on dados_cliente" ON public.dados_cliente;
DROP POLICY IF EXISTS "Allow all operations on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow all operations on n8n_chat_histories" ON public.n8n_chat_histories;

-- 5. Criar políticas RLS seguras para dados_cliente
CREATE POLICY "Users can view their own client data" 
ON public.dados_cliente 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client data" 
ON public.dados_cliente 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" 
ON public.dados_cliente 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client data" 
ON public.dados_cliente 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Criar políticas RLS seguras para documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Criar políticas RLS seguras para n8n_chat_histories
CREATE POLICY "Users can view their own chat histories" 
ON public.n8n_chat_histories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat histories" 
ON public.n8n_chat_histories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat histories" 
ON public.n8n_chat_histories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat histories" 
ON public.n8n_chat_histories 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.dados_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;