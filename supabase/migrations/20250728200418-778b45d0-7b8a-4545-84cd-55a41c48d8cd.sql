-- Create storage policies for public access to user buckets
-- Allow public read access to all objects in buckets that start with 'user-'

-- Create policy for public read access to all user buckets
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
  bucket_id LIKE 'user-%'
);

-- Create policy for authenticated users to update their own files
CREATE POLICY "Users can update their own bucket files" 
ON storage.objects 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND 
  bucket_id LIKE 'user-%'
);

-- Create policy for authenticated users to delete their own files
CREATE POLICY "Users can delete their own bucket files" 
ON storage.objects 
FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND 
  bucket_id LIKE 'user-%'
);