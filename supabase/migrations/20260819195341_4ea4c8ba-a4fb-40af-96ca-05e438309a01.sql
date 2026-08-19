-- Ensure all tasks have a valid category
UPDATE public.tasks 
SET category = 'Social' 
WHERE category IS NULL OR category = '';

-- Ensure all rewards have a valid category
ALTER TABLE public.rewards ADD COLUMN IF NOT EXISTS category text;
UPDATE public.rewards 
SET category = 'Gift Cards' 
WHERE category IS NULL OR category = '';

-- Grant permissions if missing
GRANT SELECT ON public.tasks TO authenticated;
GRANT SELECT ON public.rewards TO authenticated;
GRANT SELECT ON public.task_submissions TO authenticated;
