---
title: Update Mobile Header Design
description: Make the mobile sticky header rounded and add spacing from the screen edges.
---

## User Request
Turn the rounded edge to the sticky header on mobile.

## Proposed Changes

### Navigation Component
- Modify the mobile top bar container in `src/components/Navigation.tsx`.
- Add `top-2`, `left-2`, `right-2`, and `rounded-2xl` classes to the sticky header.
- Update positioning and width to accommodate the new margins.

## Technical Details
- Change `fixed top-0 left-0 right-0` to `fixed top-2 left-2 right-2 w-[calc(100%-1rem)]`.
- Add `rounded-2xl` to the container.
- Ensure the header remains functional and accessible.
