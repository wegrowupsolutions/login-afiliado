-- Create storage policies for public access to user buckets
-- Allow public read access to all objects in user buckets

-- First, let's create a policy for public SELECT on all user buckets
INSERT INTO storage.objects (bucket_id, name, owner, metadata) VALUES ('user-test', 'test', null, '{}') ON CONFLICT DO NOTHING;

-- Create policy for public read access to all storage objects
CREATE POLICY "Public read access to all user buckets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id LIKE 'user-%');

-- Create policy for authenticated users to upload to their own user buckets
CREATE POLICY "Users can upload to their own bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  bucket_id = CONCAT('user-', 
    COALESCE(
      (SELECT LOWER(REGEXP_REPLACE(full_name, '[^a-z0-9]', '-', 'g')) FROM public.profiles WHERE id = auth.uid()),
      LOWER(REGEXP_REPLACE(SPLIT_PART(auth.email(), '@', 1), '[^a-z0-9]', '-', 'g'))
    ),
    '-',
    SUBSTRING(auth.uid()::text, 1, 8)
  )
);

-- Create policy for authenticated users to update their own files
CREATE POLICY "Users can update their own bucket files" 
ON storage.objects 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  bucket_id = CONCAT('user-', 
    COALESCE(
      (SELECT LOWER(REGEXP_REPLACE(full_name, '[^a-z0-9]', '-', 'g')) FROM public.profiles WHERE id = auth.uid()),
      LOWER(REGEXP_REPLACE(SPLIT_PART(auth.email(), '@', 1), '[^a-z0-9]', '-', 'g'))
    ),
    '-',
    SUBSTRING(auth.uid()::text, 1, 8)
  )
);

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Users can delete their own bucket files" 
ON storage.objects 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  bucket_id = CONCAT('user-', 
    COALESCE(
      (SELECT LOWER(REGEXP_REPLACE(full_name, '[^a-z0-9]', '-', 'g')) FROM public.profiles WHERE id = auth.uid()),
      LOWER(REGEXP_REPLACE(SPLIT_PART(auth.email(), '@', 1), '[^a-z0-9]', '-', 'g'))
    ),
    '-',
    SUBSTRING(auth.uid()::text, 1, 8)
  )
);