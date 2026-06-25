# Patch: Tune Check-in Loading

This patch changes habit check-ins to feel instant.

## Changed

- Removed full-screen/global loader for habit check-ins.
- Habit cards now update optimistically as soon as the user taps.
- If Neon/API is slow, a small non-blocking `Saving quietly…` pill appears after 1.2 seconds.
- The clicked date/check button is disabled only while that specific save is in flight.
- Other page navigation and form submissions still keep loading feedback.

No database change required.
