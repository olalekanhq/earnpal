---
name: RLS Fix for Admin Task Creation
description: Fix "Error saving task: new row violates row-level security policy for table 'tasks'" by granting admin insertion/update rights.
type: feature
---

Users with the 'admin' role should be able to create, update, and delete tasks. Currently, only a read policy exists for authenticated users.

1. Add RLS policies for `INSERT`, `UPDATE`, and `DELETE` on `public.tasks` table.
2. Ensure policies use the `has_role(auth.uid(), 'admin')` check.
3. Verify `GRANT` statements are inclusive of these operations for `authenticated` users (scoped by policy).
