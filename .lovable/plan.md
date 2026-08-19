# Plan: Fix Missing Tasks and Rewards

The user reported that the task page is not showing tasks and the redeem page is not showing rewards. My investigation shows that while data exists in the database, the frontend components might be filtering them out due to missing `category` values or incorrect table references.

## Proposed Changes

### Database Maintenance
- Ensure all tasks and rewards have a valid `category` assigned to match frontend filters.
- Update the sample data to ensure they appear in the "All" and specific category views.

### Frontend Fixes
- **Earn Page (`src/routes/_authenticated.earn.tsx`)**:
    - Update the `tasks` query to use the correct table name (it was using a type cast `as any`).
    - Ensure the category filtering logic handles missing or mismatched categories gracefully.
- **Redeem Page (`src/routes/_authenticated.redeem.tsx`)**:
    - Ensure the reward category filtering logic matches the available categories in the UI.

## Technical Details
- The frontend uses `activeCategory === "All" ? data : data.filter(...)`. If a row's category is `null` or doesn't match the hardcoded category list (Social, Surveys, Videos for tasks; Gift Cards, Vouchers, Products for rewards), it might be hidden even in the "All" view if the data structure returned from Supabase is unexpected.
- I will run a migration to set default categories for existing rows that lack them.

## Verification Plan
- I will use `supabase--read_query` to verify that tasks and rewards have non-null categories.
- I will verify the frontend routes load data correctly.
