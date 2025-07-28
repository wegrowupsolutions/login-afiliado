-- Criar tabela para armazenar instâncias Evolution conectadas
CREATE TABLE public.evolution_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instance_name TEXT NOT NULL,
  phone_number TEXT,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE,
  disconnected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, instance_name)
);

-- Enable Row Level Security
ALTER TABLE public.evolution_instances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own instances" 
ON public.evolution_instances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instances" 
ON public.evolution_instances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances" 
ON public.evolution_instances 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instances" 
ON public.evolution_instances 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_evolution_instances_updated_at
BEFORE UPDATE ON public.evolution_instances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para marcar instância como conectada
CREATE OR REPLACE FUNCTION public.mark_instance_connected(
  p_user_id UUID,
  p_instance_name TEXT,
  p_phone_number TEXT DEFAULT NULL
)
RETURNS VOID
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