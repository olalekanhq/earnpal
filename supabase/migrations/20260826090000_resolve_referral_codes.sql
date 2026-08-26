CREATE OR REPLACE FUNCTION public.resolve_referral_code(_code text)
RETURNS TABLE(referrer_id uuid, username text, is_valid boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, true, 'Referral code recognized.'::text
  FROM public.profiles p
  WHERE upper(trim(p.referral_code)) = upper(trim(_code))
    AND p.id IS NOT NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, 'Referral code not found.'::text;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_referral_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_referral_code(text) TO anon, authenticated;
