-- Drop redundant user_id column and constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS fk_user,
DROP COLUMN IF EXISTS user_id;

-- Update handle_new_user function to remove user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use id instead of user_id
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);