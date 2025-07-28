-- Add prompt column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN prompt text;