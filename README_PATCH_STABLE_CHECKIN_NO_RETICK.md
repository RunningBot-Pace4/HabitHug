# Patch: Stable Instant Check-in

This patch fixes the issue where unticking a habit could be ticked back automatically by a slower server response.

## What changed

- Habit cells still update instantly.
- The client sends the desired final state (`completed: true/false`) instead of asking the server to blindly toggle.
- Requests for the same habit/date are saved sequentially.
- Slow/stale responses are ignored and cannot overwrite the latest tap.
- The API remains backward-compatible: if `completed` is not provided, it still toggles.

## Files changed

- `components/HabitFeed.tsx`
- `app/api/habits/toggle/route.ts`

No database change is required.
