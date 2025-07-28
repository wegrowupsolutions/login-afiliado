-- Create table for global system configurations
CREATE TABLE public.system_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;

-- Create policies - Only allow reading for all authenticated users
CREATE POLICY "Anyone can view system configurations" 
ON public.system_configurations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only specific admin users can insert/update/delete configurations
CREATE POLICY "Only admins can modify system configurations" 
ON public.system_configurations 
FOR ALL 
USING (
  auth.jwt() ->> 'email' IN ('viniciushtx@gmail.com', 'rfreitasdc@gmail.com')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_configurations_updated_at
    BEFORE UPDATE ON public.system_configurations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default webhook configurations
INSERT INTO public.system_configurations (key, value, description) VALUES
('webhook_mensagem', 'https://webhook.n8nlabz.com.br/webhook/envia_mensagem', 'Endpoint para enviar mensagens'),
('webhook_pausa_bot', 'https://webhook.n8nlabz.com.br/webhook/pausa_bot', 'Endpoint para pausar bot'),
('webhook_inicia_bot', 'https://webhook.n8nlabz.com.br/webhook/inicia_bot', 'Endpoint para iniciar bot'),
('webhook_agenda', 'https://webhook.n8nlabz.com.br/webhook/agenda', 'Endpoint para agenda'),
('webhook_agenda_alterar', 'https://webhook.n8nlabz.com.br/webhook/agenda/alterar', 'Endpoint para alterar agenda'),
('webhook_agenda_adicionar', 'https://webhook.n8nlabz.com.br/webhook/agenda/adicionar', 'Endpoint para adicionar na agenda'),
('webhook_agenda_excluir', 'https://webhook.n8nlabz.com.br/webhook/agenda/excluir', 'Endpoint para excluir da agenda'),
('webhook_envia_rag', 'https://webhook.n8nlabz.com.br/webhook/envia_rag', 'Endpoint para enviar RAG'),
('webhook_excluir_arquivo_rag', 'https://webhook.n8nlabz.com.br/webhook/excluir-arquivo-rag', 'Endpoint para excluir arquivo RAG'),
('webhook_excluir_rag', 'https://webhook.n8nlabz.com.br/webhook/excluir-rag', 'Endpoint para excluir RAG'),
('webhook_instancia_evolution', 'https://webhook.serverwegrowup.com.br/webhook/instancia-evolution-afiliado', 'Endpoint para instância Evolution'),
('webhook_atualizar_qr_code', 'https://webhook.n8nlabz.com.br/webhook/atualizar-qr-code-afiliado', 'Endpoint para atualizar QR Code'),
('webhook_confirma', 'https://webhook.n8nlabz.com.br/webhook/confirma', 'Endpoint para confirmar');