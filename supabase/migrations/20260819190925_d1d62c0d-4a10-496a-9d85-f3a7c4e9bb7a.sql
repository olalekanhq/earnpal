
ALTER FUNCTION public.log_task_status_change() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.log_task_status_change() FROM authenticated, anon;
GRANT EXECUTE ON FUNCTION public.log_task_status_change() TO service_role;
