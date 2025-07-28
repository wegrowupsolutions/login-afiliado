-- Create documents table for storing file metadata
CREATE TABLE public.documents (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update documents" 
ON public.documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete documents" 
ON public.documents 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();