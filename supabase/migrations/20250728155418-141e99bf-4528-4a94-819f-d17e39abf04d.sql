-- Create image_files table for image storage
CREATE TABLE public.image_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Imagem',
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.image_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific access
CREATE POLICY "Users can view their own images"
ON public.image_files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own images"
ON public.image_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
ON public.image_files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
ON public.image_files
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_image_files_updated_at
BEFORE UPDATE ON public.image_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for images bucket
CREATE POLICY "Users can view their own images in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own images to storage"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own images in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images from storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);