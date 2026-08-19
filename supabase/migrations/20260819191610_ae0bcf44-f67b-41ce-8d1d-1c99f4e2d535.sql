-- Re-run the points balance update trigger creation
CREATE OR REPLACE FUNCTION public.update_points_balance_on_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_points integer;
BEGIN
  -- Only act if the status is changing to 'verified'
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    -- Get task points
    SELECT points INTO v_points FROM public.tasks WHERE id = NEW.task_id;
    
    -- Update profile points_balance
    UPDATE public.profiles
    SET points_balance = COALESCE(points_balance, 0) + v_points
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_submission_verified ON public.task_submissions;

CREATE TRIGGER on_task_submission_verified
  AFTER UPDATE ON public.task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_points_balance_on_task_status_change();

-- Secure existing functions to address linter warnings
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public;
REVOKE ALL ON FUNCTION public.claim_daily_reward(uuid) FROM public;
REVOKE ALL ON FUNCTION public.submit_task(uuid, uuid) FROM public;
REVOKE ALL ON FUNCTION public.log_task_status_change() FROM public;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_daily_reward(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_task(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_task_status_change() TO service_role;
