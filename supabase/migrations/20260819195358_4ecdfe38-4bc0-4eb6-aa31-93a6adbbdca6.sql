-- Distribute tasks into categories so they show up under filters
UPDATE public.tasks SET category = 'Videos' WHERE title ILIKE '%Watch%' OR title ILIKE '%Tutorial%';
UPDATE public.tasks SET category = 'Social' WHERE title ILIKE '%Facebook%' OR title ILIKE '%Twitter%' OR title ILIKE '%Share%';
UPDATE public.tasks SET category = 'Surveys' WHERE title ILIKE '%Survey%' OR title ILIKE '%Questionnaire%';

-- Distribute rewards into categories
UPDATE public.rewards SET category = 'Gift Cards' WHERE title ILIKE '%Card%' OR title ILIKE '%Amazon%' OR title ILIKE '%Play%';
UPDATE public.rewards SET category = 'Vouchers' WHERE title ILIKE '%Voucher%' OR title ILIKE '%Netflix%';
UPDATE public.rewards SET category = 'Products' WHERE title ILIKE '%Product%' OR title ILIKE '%Items%';
