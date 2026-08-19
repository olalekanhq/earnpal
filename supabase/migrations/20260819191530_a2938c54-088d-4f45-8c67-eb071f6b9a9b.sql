-- Update all existing users' referral_code to be their username if they have one
UPDATE public.profiles
SET referral_code = username
WHERE username IS NOT NULL AND (referral_code IS NULL OR referral_code != username);

-- Update the handle_new_user trigger function to ensure future users get their username as referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, avatar_url, referral_code)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'username'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    referral_code = COALESCE(profiles.referral_code, EXCLUDED.username);
  RETURN new;
END;
$$;