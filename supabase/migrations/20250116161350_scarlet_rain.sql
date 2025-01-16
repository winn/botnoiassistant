/*
  # Rename profiles id column to user_id

  1. Changes
    - Rename `id` column to `user_id` in profiles table
    - Update foreign key reference
    - Update RLS policies
    - Update handle_new_user function

  2. Security
    - Maintain existing RLS policies with updated column name
*/

-- Rename id column to user_id
ALTER TABLE public.profiles
RENAME COLUMN id TO user_id;

-- Update foreign key reference
ALTER TABLE public.profiles
DROP CONSTRAINT profiles_pkey,
ADD CONSTRAINT profiles_pkey PRIMARY KEY (user_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, username, full_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update index
DROP INDEX IF EXISTS idx_profiles_id;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);