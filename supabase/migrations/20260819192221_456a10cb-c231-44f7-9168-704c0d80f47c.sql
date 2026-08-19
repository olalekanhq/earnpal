REVOKE ALL ON FUNCTION public.claim_daily_reward(uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward(uuid) TO service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role, authenticated;

REVOKE ALL ON FUNCTION public.log_task_status_change() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_task_status_change() TO service_role;

REVOKE ALL ON FUNCTION public.log_user_task_activity() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_task_activity() TO service_role;

REVOKE ALL ON FUNCTION public.submit_task(uuid, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_task(uuid, uuid) TO service_role, authenticated;

REVOKE ALL ON FUNCTION public.update_points_balance_on_task_status_change() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_points_balance_on_task_status_change() TO service_role;
