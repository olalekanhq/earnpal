REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.submit_task(uuid, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.submit_task(uuid, uuid) TO service_role;

-- Wait, I need to know which functions the linter is complaining about. 
-- Since I revoked from public, anon, authenticated already, maybe the linter is seeing that they are in 'public' schema and thus 'authenticated' might still have it?
-- Actually, REVOKE ALL should have removed it.
-- Let's check the remaining 4 issues.
