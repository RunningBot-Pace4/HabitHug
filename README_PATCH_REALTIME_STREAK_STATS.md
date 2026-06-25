# Patch: real-time streak/best/done stats

This patch changes habit check-in UI to be fully client-live:

- Tick/untick squares update immediately.
- Current streak updates immediately.
- Best streak updates immediately.
- Done count updates immediately.
- Neon/API responses no longer overwrite newer local user actions.
- API still saves the final desired state quietly in the background.

Streak convention kept:
- 1 consecutive completed day = 1 streak
- 2 consecutive completed days = 2 streak
- 3 consecutive completed days = 3 streak
