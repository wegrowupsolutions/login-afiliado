-- Create table for client data
CREATE TABLE public.dados_cliente (
  id SERIAL PRIMARY KEY,
  nome TEXT,
  email TEXT,
  telefone TEXT,
  nome_pet TEXT,
  porte_pet TEXT,
  raca_pet TEXT,
  cpf_cnpj TEXT,
  asaas_customer_id TEXT,
  payments JSONB,
  sessionid TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for chat histories
CREATE TABLE public.n8n_chat_histories (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  message JSONB,
  data TIMESTAMP WITH TIME ZONE,
  hora TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dados_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since there's no auth context in the current code)
CREATE POLICY "Allow all operations on dados_cliente" ON public.dados_cliente FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on n8n_chat_histories" ON public.n8n_chat_histories FOR ALL USING (true) WITH CHECK (true);

-- Create triggers for updating timestamps
CREATE TRIGGER update_dados_cliente_updated_at
  BEFORE UPDATE ON public.dados_cliente
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_dados_cliente_sessionid ON public.dados_cliente(sessionid);
CREATE INDEX idx_dados_cliente_telefone ON public.dados_cliente(telefone);
CREATE INDEX idx_n8n_chat_histories_session_id ON public.n8n_chat_histories(session_id);
CREATE INDEX idx_n8n_chat_histories_hora ON public.n8n_chat_histories(hora);