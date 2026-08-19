DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'app_role' AND enumlabel = 'moderator') THEN
        ALTER TYPE public.app_role ADD VALUE 'moderator';
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activity_logs TO authenticated;
GRANT ALL ON public.user_activity_logs TO service_role;

ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their own activity') THEN
        CREATE POLICY "Users can see their own activity"
        ON public.user_activity_logs
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.log_user_task_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    task_title TEXT;
    task_pts INTEGER;
BEGIN
    SELECT title, points INTO task_title, task_pts FROM public.tasks WHERE id = NEW.task_id;
    
    IF (TG_OP = 'INSERT' AND NEW.status = 'pending') OR (TG_OP = 'UPDATE' AND OLD.status != 'pending' AND NEW.status = 'pending') THEN
        INSERT INTO public.user_activity_logs (user_id, type, title, description, metadata)
        VALUES (NEW.user_id, 'task_submitted', task_title, 'Task submitted for verification', jsonb_build_object('task_id', NEW.task_id));
    END IF;

    IF (TG_OP = 'UPDATE' AND OLD.status != 'verified' AND NEW.status = 'verified') THEN
        INSERT INTO public.user_activity_logs (user_id, type, title, description, points_earned, metadata)
        VALUES (NEW.user_id, 'task_verified', task_title, 'Task verified and points awarded', task_pts, jsonb_build_object('task_id', NEW.task_id));
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_submission_activity ON public.task_submissions;
CREATE TRIGGER on_task_submission_activity
AFTER INSERT OR UPDATE ON public.task_submissions
FOR EACH ROW EXECUTE FUNCTION public.log_user_task_activity();
