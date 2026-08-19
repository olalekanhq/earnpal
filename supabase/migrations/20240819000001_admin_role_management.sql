-- Ensure rolalekanhq@gmail.com is an admin
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

-- Policies for user_roles to allow admins to manage roles
-- We use a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.assign_role(target_user_id UUID, new_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_role(target_user_id UUID, role_to_remove public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can remove roles';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = role_to_remove;
END;
$$;

GRANT EXECUTE ON FUNCTION public.assign_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) TO authenticated;
