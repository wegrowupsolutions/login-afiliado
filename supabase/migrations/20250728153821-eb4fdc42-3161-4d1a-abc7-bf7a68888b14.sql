-- Make user_id NOT NULL in documents table
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;