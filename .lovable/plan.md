---
title: Implement Mobile Hamburger Menu
description: Add a functional hamburger menu to the mobile navigation for both landing and authenticated pages.
---

## User Request
Implement a hamburger menu on mobile so navigation links are easy to access.

## Proposed Changes

### Navigation Component (`src/components/Navigation.tsx`)
- The authenticated view already has a hamburger icon (`Menu`) that opens an off-canvas drawer. I will ensure it includes all relevant links for easy access.
- The landing page view (unauthenticated) currently has a top bar but lacks a mobile menu for the "Product", "Network", and "Rewards" links.
- I will implement a mobile menu for the landing page using the same `Sheet` pattern or the existing overlay pattern used in the authenticated view.

### Landing Page Mobile Menu
- Add a `Menu` button to the mobile version of the landing page header.
- Create a mobile menu overlay for the landing page that displays:
  - Product (Earn Points)
  - Network (Referral)
  - Rewards (Redeem)
  - Log in / Get Started buttons

## Technical Details
- Reuse the `isMobileMenuOpen` state or create a separate one for the landing page if needed.
- Ensure consistent styling with the new rounded sticky header design.
- Use `lucide-react` icons for consistency.
