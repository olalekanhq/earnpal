# Plan: Linked Notifications to Transactions

Allow users to click notifications to view the associated transaction details, improving navigation and visibility.

## User Review Required

> [!IMPORTANT]
> - Should clicking a notification only show a toast (like in the Transactions page) or navigate to the Transactions page and highlight the item? (Plan assumes toast for consistency with existing "transaction details" behavior, but navigation is also possible).

## Proposed Changes

### Database & Schema
- No schema changes required as `notifications` already has a `type` column.
- Will ensure that when point-related notifications are created, the `source_id` of the notification matches the `points_transactions` ID where applicable.

### Component Enhancements
#### Notifications Popover
- Update `src/components/NotificationsPopover.tsx` to:
    - Add a `handleNotificationClick` function.
    - If a notification type is related to points/transactions, attempt to fetch the transaction details using the notification's context or a new `transaction_id` field if we add one (or use `source_id` if available in the metadata).
    - Actually, I'll add a `transaction_id` field to the `notifications` table or use a JSON `metadata` column if it exists to store the transaction ID.
    - Since `notifications` table doesn't have a `metadata` or `transaction_id` column currently (based on previous `supabase--read_query`), I will add a `transaction_id` column.

#### Transaction Details
- Create a shared utility or component for displaying the "Transaction Details" toast/modal to avoid code duplication between `TransactionsPage` and `NotificationsPopover`.

## Technical Details
- **Migration**: Add `transaction_id` (UUID, nullable) to `notifications` table.
- **RPC/Triggers**: Update triggers that generate notifications (e.g., on point gain) to populate the `transaction_id`.
- **Frontend**:
    - Update `NotificationsPopover` to detect `transaction_id`.
    - On click, mark as read AND show the transaction details overlay.
    - If `transaction_id` is present, fetch the specific transaction from `points_transactions`.

## Verification Plan
1. **Manual Test**: Earn points (e.g., daily claim) and check if the resulting notification, when clicked, shows the transaction details.
2. **UI Check**: Ensure the click behavior doesn't conflict with "Mark as Read" logic.
