# Patch: Mobile Settings UI

This patch makes the Settings page mobile-friendly.

## Changes

- Settings hero stacks cleanly on phones.
- Admin/member badge becomes full-width on mobile.
- Profile card header stacks vertically on phones.
- Mascot picker uses compact 4-column mobile layout.
- Dashboard color choices become single-column mobile cards.
- Inputs now use mobile-safe sizing to avoid overflow/zoom.
- Long email/status text wraps instead of pushing the layout sideways.

## Deploy

```bash
git add .
git commit -m "Fix mobile settings page layout"
git push
```

Then redeploy on Vercel.
