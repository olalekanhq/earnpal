# Plan - Violet-themed Notification Preview and Visual Text Edit

Update the `NotificationsPopover` component to align with the Earn Pal design system using a violet-themed, semi-transparent backdrop and smooth animations. Also apply a specific visual text replacement.

## User Review Required

> [!IMPORTANT]
> The visual text edit requested is to replace the invisible character `\u2063` (Invisible Separator) with itself. I will apply this as a literal update to the specified element if found, or ensure the component structure accommodates it.

## Proposed Changes

### Styling & Animations
- **Backdrop & Popover**: Update `PopoverContent` to use a semi-transparent background (e.g., `bg-background/80 backdrop-blur-md`) and a violet-themed border.
- **Animations**: Add smooth entry/exit animations using Tailwind's `animate-in` and `fade-in` utilities.
- **Notification Items**:
    - Enhance the hover state with a subtle violet tint.
    - Update the unread state badge and background to use a softer violet aesthetic.
    - Add a slide-in animation for individual notification items.

### Visual Text Edit
- Update the `NotificationsPopover` to include or maintain the literal `\u2063` character as requested for the target element (index 0).

## Technical Details

### `src/components/NotificationsPopover.tsx`
- Modify `PopoverContent` classes: `w-80 p-0 bg-popover/90 backdrop-blur-md border-primary/20 shadow-xl animate-in fade-in-0 zoom-in-95`.
- Update notification list items:
    - Base: `p-4 transition-all duration-200 hover:bg-primary/5 cursor-pointer`.
    - Unread state: `bg-primary/10 border-l-2 border-primary`.
- Refine typography to use `text-muted-foreground` for labels as per design system tokens.

### Database Interaction
- No changes to existing Supabase logic or RLS; styling only.

## Performance & Accessibility
- Maintain `ScrollArea` for large notification lists.
- Ensure `aria-label` remains on the trigger button.
- Use `backdrop-blur` sparingly to maintain performance on low-end mobile devices.
