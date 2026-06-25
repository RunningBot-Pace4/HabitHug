# HabitHug Patch: Battle layout + loading + date rules

## Changes

- Fixed Battle create/join layout alignment.
- Added a route-level loading screen (`app/loading.tsx`).
- Added button spinners/pending states for Battle create/join forms.
- Added saving state for habit check buttons/grid cells.
- Habit check-ins are now limited to today and yesterday only.
- Older dates and future dates are disabled in the UI.
- API also enforces the today/yesterday check-in window.

## Deploy

```bash
git add .
git commit -m "Fix Battle layout loading states and date rules"
git push
```

Then redeploy on Vercel with Clear Build Cache.
