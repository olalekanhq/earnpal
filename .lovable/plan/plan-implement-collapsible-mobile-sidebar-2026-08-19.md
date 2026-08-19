# Plan: Implement Collapsible Mobile Sidebar

The goal is to make the mobile sidebar collapsible to allow the main content to occupy the full width of the screen.

## User Review Required

> [!IMPORTANT]
> The current mobile navigation already uses a "drawer" style (Sheet) overlay that is triggered by a menu button. This overlay is *already* collapsible (it's hidden until the user clicks the menu icon) and it doesn't push content down—it floats over it.
> 
> However, if you are referring to the **Desktop Sidebar** that appears when the screen is larger, or if you want a different behavior for the mobile top-bar, please clarify. 
> 
> **My interpretation of your request:** You want to ensure the mobile experience feels "full-width" and the navigation doesn't interfere with content until explicitly requested.

## Proposed Changes

### Navigation Component
- Refine the mobile top-bar to ensure it doesn't take up unnecessary vertical space.
- Verify the mobile overlay (Sheet/Drawer) implementation is optimized for full-width content behind it.
- Ensure `src/routes/__root.tsx` correctly handles padding for the main content so it can be truly full-width on mobile.

### Layout Adjustment
- Adjust `src/routes/__root.tsx` to remove any unnecessary `pl-72` (left padding) on mobile breakpoints.

## Technical Details
- Use `md:pl-72` for the content wrapper in `__root.tsx` to ensure padding only exists when the desktop sidebar is visible.
- Ensure the mobile top-bar in `src/components/Navigation.tsx` has `w-full` and proper `backdrop-blur` for a premium feel.
