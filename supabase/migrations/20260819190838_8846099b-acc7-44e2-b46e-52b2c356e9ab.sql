
-- 1. Create task_audit_logs table
CREATE TABLE IF NOT EXISTS public.task_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_submission_id UUID NOT NULL REFERENCES public.task_submissions(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Grant permissions on audit logs
GRANT SELECT ON public.task_audit_logs TO authenticated;
GRANT ALL ON public.task_audit_logs TO service_role;

-- 3. Enable RLS on audit logs
ALTER TABLE public.task_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for audit logs
CREATE POLICY "Admins can see all audit logs"
    ON public.task_audit_logs
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- 5. Trigger to automatically log status changes in task_submissions
CREATE OR REPLACE FUNCTION public.log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.task_audit_logs (task_submission_id, old_status, new_status, changed_by)
        VALUES (NEW.id, NULL, NEW.status, auth.uid());
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.task_audit_logs (task_submission_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_status_change ON public.task_submissions;
CREATE TRIGGER on_task_status_change
    AFTER INSERT OR UPDATE ON public.task_submissions
    FOR EACH ROW EXECUTE FUNCTION public.log_task_status_change();

-- 6. Ensure proper RLS policies for tasks table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Admins have full access to tasks') THEN
        CREATE POLICY "Admins have full access to tasks"
            ON public.tasks
            FOR ALL
            TO authenticated
            USING (public.has_role(auth.uid(), 'admin'))
            WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END
$$;
