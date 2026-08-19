-- Restore admin privilege for rolalekanhq@gmail.com
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'rolalekanhq@gmail.com';
    
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END $$;

-- Fix task and reward categories for visibility
UPDATE public.tasks 
SET category = 'Social' 
WHERE category IS NULL OR category NOT IN ('Social', 'Surveys', 'Videos', 'Daily');

UPDATE public.rewards 
SET category = 'Gift Cards' 
WHERE category IS NULL OR category NOT IN ('Gift Cards', 'Vouchers', 'Products');

UPDATE public.tasks SET is_active = true WHERE is_active = false;
UPDATE public.rewards SET is_active = true WHERE is_active = false;

-- Ensure public access to the email resolver RPC
GRANT EXECUTE ON FUNCTION public.get_user_email_by_username(text) TO anon, authenticated;
