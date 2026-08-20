---
title: Restore Admin Panel Section on Refresh
description: Persist the selected Admin Panel tab in localStorage and restore it when the page is reloaded.
---

## User Review Required

> [!IMPORTANT]
> This change will use `localStorage` to remember which tab you were last viewing in the Admin Panel (e.g., Users, Fraud, Tasks). When you refresh the page or return later, it will automatically open that same section.

- Do you want this persistence to last indefinitely (localStorage), or only for the duration of your current browser session (sessionStorage)? Defaulting to `localStorage` for a better "return to work" experience.

## Proposed Changes

### Admin Components

#### [src/components/AdminPanel.tsx](src/components/AdminPanel.tsx)
- Initialize the `activeTab` state from `localStorage`.
- Update `localStorage` whenever the user switches tabs.

## Technical Details

- **Storage Key**: `earnpal_admin_last_tab`
- **Fallback**: Defaults to `"users"` if no saved tab is found.
- **Implementation**:
  - `const [activeTab, setActiveTab] = useState(() => localStorage.getItem("earnpal_admin_last_tab") || "users");`
  - A `useEffect` hook to sync the `activeTab` value back to `localStorage` on change.

## Verification Plan

### Automated Tests
- N/A (UI state persistence)

### Manual Verification
1. Navigate to the Admin Panel.
2. Switch to a tab other than "Users" (e.g., "Fraud" or "Tasks").
3. Refresh the page.
4. Verify that the Admin Panel restores the previously selected tab instead of defaulting to "Users".
