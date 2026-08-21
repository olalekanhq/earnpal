-- Fix the trigger functions if they were accidentally created as standard functions
-- or if they are missing entirely.

-- 1. update_points_balance_on_task_status_change
CREATE OR REPLACE FUNCTION public.update_points_balance_on_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only award points when status changes to 'verified'
    IF (TG_OP = 'UPDATE' AND OLD.status <> 'verified' AND NEW.status = 'verified') OR
       (TG_OP = 'INSERT' AND NEW.status = 'verified') THEN
        
        -- Get task points
        INSERT INTO public.points_transactions (user_id, amount, type, description)
        SELECT NEW.user_id, t.points, 'earn', 'Completed task: ' || t.title
        FROM public.tasks t
        WHERE t.id = NEW.task_id;
        
    END IF;
    RETURN NEW;
END;
$$;

-- 2. log_task_status_change
CREATE OR REPLACE FUNCTION public.log_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
        INSERT INTO public.admin_audit_logs (target_table, target_id, action_type, old_data, new_data)
        VALUES ('task_submissions', NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
END;
$$;

-- 3. log_user_task_activity
CREATE OR REPLACE FUNCTION public.log_user_task_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Potential for logging user activity analytics here
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;

-- 4. Re-attach triggers to task_submissions
DROP TRIGGER IF EXISTS on_task_status_change ON public.task_submissions;
CREATE TRIGGER on_task_status_change
    AFTER UPDATE ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_task_status_change();

DROP TRIGGER IF EXISTS on_task_submission_verified ON public.task_submissions;
CREATE TRIGGER on_task_submission_verified
    AFTER INSERT OR UPDATE ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_points_balance_on_task_status_change();

DROP TRIGGER IF EXISTS on_task_submission_activity ON public.task_submissions;
CREATE TRIGGER on_task_submission_activity
    AFTER INSERT ON public.task_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_task_activity();

-- 5. Final permissions check
REVOKE ALL ON FUNCTION public.update_points_balance_on_task_status_change() FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.update_points_balance_on_task_status_change() TO service_role;

REVOKE ALL ON FUNCTION public.log_task_status_change() FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.log_task_status_change() TO service_role;

REVOKE ALL ON FUNCTION public.log_user_task_activity() FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.log_user_task_activity() TO service_role;
