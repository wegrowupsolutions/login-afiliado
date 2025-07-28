-- Create audio_files table for audio storage
CREATE TABLE public.audio_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration INTEGER, -- duration in seconds
  bitrate INTEGER, -- audio bitrate
  sample_rate INTEGER, -- audio sample rate
  channels INTEGER, -- number of audio channels (mono=1, stereo=2)
  thumbnail_url TEXT,
  category TEXT DEFAULT 'Áudio',
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audio_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user-specific access
CREATE POLICY "Users can view their own audios"
ON public.audio_files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own audios"
ON public.audio_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own audios"
ON public.audio_files
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audios"
ON public.audio_files
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_audio_files_updated_at
BEFORE UPDATE ON public.audio_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for audio bucket
CREATE POLICY "Users can view their own audios in storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own audios to storage"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own audios in storage"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own audios from storage"
ON storage.objects
FOR DELETE
USING (bucket_id = 'audio' AND auth.uid()::text = (storage.foldername(name))[1]);