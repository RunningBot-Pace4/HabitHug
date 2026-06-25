# HabitHug Patch — Instant Check-In Toggle

This patch tunes the habit check-in interaction.

## Changes

- Ticking a habit updates the UI immediately.
- User can untick immediately without waiting for the server response.
- Rapid tick/untick taps are batched:
  - even number of taps cancels out and sends no request
  - odd number of taps sends one server toggle
- No spinner and no saving pill for habit check-ins.
- Slower actions such as login/register/battle/rewards still keep loading feedback.

## Deploy

```bash
git add .
git commit -m "Make habit check-in instant"
git push
```

Then redeploy on Vercel.
