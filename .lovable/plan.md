# Plan: Welcome Bonus & Referral Improvements

Implement a one-time welcome bonus claim popup for new users and improve the referral code validation during sign-up.

## User Review Required

> [!IMPORTANT]
> The welcome bonus (50 points) is currently awarded automatically in the database via the `reward_referrer_on_signup` trigger when a user signs up with a referral code. This plan adds a UI popup for the user to "claim" it (confirming they see the reward), while keeping the underlying balance secure.

## Proposed Changes

### Database Schema & Logic
- Add `has_claimed_welcome_bonus` boolean column to `public.profiles` (defaults to `false`).
- Update `handle_new_user` and `reward_referrer_on_signup` to ensure consistent referral tracking.
- Create a `claim_welcome_bonus` RPC function that marks the bonus as claimed and returns the amount if eligible.

### Frontend Enhancements

#### Sign-up Improvements (`src/routes/auth.tsx`)
- Add a debounce effect or blur handler to the Referral Code input.
- On code entry, query the `profiles` table to check if the code exists.
- Show a real-time "Referrer: [Username] ✅" or "Invalid code ❌" status message below the input.

#### Welcome Bonus Popup (`src/components/WelcomeBonusModal.tsx`)
- Create a new modal component with high-quality "Earn Pal" branding.
- The modal will trigger only if:
  1. The user is logged in.
  2. The user has a referrer (`referred_by` is not null).
  3. The bonus hasn't been claimed yet (`has_claimed_welcome_bonus` is false).
- Add a "Claim Bonus" button that calls the new RPC and triggers a confetti effect.

#### Dashboard Integration (`src/routes/_authenticated.dashboard.tsx`)
- Mount the `WelcomeBonusModal` at the top level.
- Ensure it only checks/shows on the first successful login session.

## Technical Details
- **Migration**:
  ```sql
  ALTER TABLE public.profiles ADD COLUMN has_claimed_welcome_bonus BOOLEAN DEFAULT FALSE;

  CREATE OR REPLACE FUNCTION public.check_referral_code(_code TEXT)
  RETURNS TABLE (username TEXT, exists BOOLEAN) 
  LANGUAGE plpgsql SECURITY DEFINER AS $$
  BEGIN
    RETURN QUERY SELECT p.username, TRUE FROM public.profiles p WHERE p.referral_code = _code;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION public.check_referral_code(TEXT) TO authenticated, anon;
  ```
- **State Management**: Use `localStorage` to prevent the modal from re-triggering within the same session if the user closes it without claiming (though `has_claimed_welcome_bonus` is the ultimate source of truth).
