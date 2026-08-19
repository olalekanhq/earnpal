-- Add RLS policies for admin task management
CREATE POLICY "Admins can insert tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tasks" ON public.tasks
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tasks" ON public.tasks
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Ensure grants are in place for authenticated users to perform these actions
GRANT INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
