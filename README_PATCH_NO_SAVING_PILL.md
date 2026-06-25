# Patch: Remove Check-in Saving Pill

Updated habit check-in UX so tapping a cell feels instant and clean.

- Removed visible `Saving quietly…` status from the habit card.
- Check-ins still update immediately.
- Failed saves roll back and show a friendly error.
- Slower actions such as login, register, battle, rewards, and edit still show loading feedback.

No database changes required.
