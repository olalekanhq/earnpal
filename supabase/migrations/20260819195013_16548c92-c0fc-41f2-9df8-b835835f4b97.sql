-- Revoke all to ensure clean slate for newly created functions
REVOKE ALL ON FUNCTION public.assign_role(UUID, public.app_role) FROM public, anon, authenticated;
REVOKE ALL ON FUNCTION public.remove_role(UUID, public.app_role) FROM public, anon, authenticated;

-- Grant to authenticated users (internal admin checks handle the rest)
GRANT EXECUTE ON FUNCTION public.assign_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_role(UUID, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.remove_role(UUID, public.app_role) TO service_role;
