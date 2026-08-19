-- Grant permissions on tasks to admin and task_manager
DROP POLICY IF EXISTS "Admins and task managers can insert tasks" ON public.tasks;
CREATE POLICY "Admins and task managers can insert tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'task_manager'));

DROP POLICY IF EXISTS "Admins and task managers can update tasks" ON public.tasks;
CREATE POLICY "Admins and task managers can update tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'task_manager'));

DROP POLICY IF EXISTS "Admins and task managers can delete tasks" ON public.tasks;
CREATE POLICY "Admins and task managers can delete tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'task_manager'));

-- Update RLS for task_submissions so moderators/admins can verify
ALTER TABLE public.task_submissions ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Admins and moderators can manage task submissions" ON public.task_submissions;
CREATE POLICY "Admins and moderators can manage task submissions"
ON public.task_submissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Permissions for redemptions
DROP POLICY IF EXISTS "Admins and moderators can manage redemptions" ON public.redemptions;
CREATE POLICY "Admins and moderators can manage redemptions"
ON public.redemptions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

GRANT ALL ON public.redemptions TO authenticated;
GRANT ALL ON public.redemptions TO service_role;
