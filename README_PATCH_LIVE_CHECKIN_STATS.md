# Patch: Live Habit Stats After Instant Check-In

This patch makes the habit card stats update immediately when users tick or untick a habit.

## Fixed

- Current streak updates instantly.
- Best streak increases instantly when today/yesterday creates a longer run.
- Total completions updates instantly.
- Today summary updates instantly.
- Server response quietly reconciles stats after Neon saves.
- Rapid tick/untick remains instant and batched.

## Important UX Behavior

Habit check-in does not show a loading spinner because it should feel instant. Slow actions such as login, register, create battle, edit habit, and rewards still use loading feedback.
