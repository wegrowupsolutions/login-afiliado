-- Enable realtime for system_configurations table
ALTER TABLE public.system_configurations REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_configurations;