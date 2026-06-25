# Patch: Remove Check-in Saving Pill

Updated the habit check-in UX so tapping a grid cell feels instant and clean.

## Changes

- Removed the visible `Saving quietly…` pill from habit cards.
- Habit check-ins still update optimistically immediately.
- If saving fails, the app rolls back and shows a friendly error.
- Login, register, battle, rewards, and other slower actions still keep loading feedback.

No database changes required.
