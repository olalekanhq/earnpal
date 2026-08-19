# Plan: Overhaul Dashboard and Navigation to Match Spectrey Design

The user wants to update the dashboard and navigation to match a specific "Spectrey" aesthetic, as seen in the provided screenshots. This involves a shift from the current gradient-heavy, bold "Earn Pal" style to a cleaner, more minimalist, grid-based UI with a bottom tab bar for mobile and a modern sidebar/dropdown for additional actions.

## User Preferences & Design Rules
- **Aesthetic**: Minimalist, modern, grid-based background.
- **Color Palette**: Clean white background with subtle borders, primary purple accents.
- **Mobile Navigation**: Bottom tab bar (Home, Market, Wallet, Menu) + modern overlay menu.
- **Desktop Navigation**: Modern sidebar or top bar with a clean dropdown for user profile.
- **Dashboard Layout**: Centered greeting, large "Combined Balance" card, grid of "Quick Actions" with icons.

## Proposed Changes

### 1. Global Styles & Theme
- Refine `src/styles.css` to ensure the `bg-grid` utility matches the subtle Spectrey grid (lighter lines, perhaps a different size).
- Ensure typography (Space Grotesk for headings) is consistently applied.

### 2. Navigation Overhaul (`src/components/Navigation.tsx`)
- **Mobile**:
    - Implement a fixed bottom navigation bar with icons for "Home", "Market", "Wallet", and "Menu".
    - "Menu" will trigger the modern overlay menu (Sheet) which will contain the full list of navigation items, user profile info, and logout.
- **Desktop**:
    - Clean up the top navigation to match the minimalist header in the screenshots.
    - Implement the "USD/NGN" currency toggle and a user avatar dropdown that shows profile info, settings, and logout.

### 3. Dashboard Redesign (`src/routes/dashboard.tsx`)
- **Layout**:
    - Add the `bg-grid` to the main container.
    - Centered "Good afternoon, [Name]" greeting with a date sub-header.
    - A large, prominent "Combined Balance" card with a currency selector dropdown.
    - A "QUICK ACTIONS" section featuring a responsive grid of icons (e.g., Fund Wallet, Courses, Marketplace, Store, Gallery, Invoices, Airtime, Data, Electricity).
- **Interactions**:
    - Update the icons to match the colorful, rounded style in the screenshots.
    - Integrate existing logic (streak, tasks, balance) into this new layout.

### 4. Component Refinements
- **Quick Action Icons**: Create a reusable component for the circular, colorful icons used in the dashboard grid.
- **Overlay Menu**: Refine the `Sheet` content in `Navigation.tsx` to match the "Spectrey" sidebar layout, including the user profile section at the bottom.

## Technical Details
- Use **Tailwind CSS v4** utilities for layouts and styling.
- Leverage **Lucide React** for icons, mapping them to the specific actions.
- Maintain **TanStack Query** for data fetching and state management.
- Ensure **Supabase** RLS and authentication remain fully integrated.

## Validation Plan
- Verify responsive layout on mobile (bottom tab bar visibility) and desktop (header layout).
- Check that all quick actions link to the correct existing routes (or placeholders where routes don't exist yet).
- Confirm the user profile dropdown and mobile menu overlay work as expected.
- Validate that the "Claim Daily Reward" functionality is still accessible within the new layout.
