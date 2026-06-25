# Patch: Design Sync With ASP.NET Version

This patch standardizes the Vercel + Neon Next.js UI to match the nicer ASP.NET Core card-feed design.

## Updated

- Home page now uses ASP.NET-style:
  - sticky top app bar
  - big feed hero
  - summary bubbles
  - gradient progress track
  - quick check-in chips
  - larger visual habit cards
  - ASP.NET-style grid pixels and card metadata

- Battle page now uses ASP.NET-style:
  - hero card
  - my rooms pill
  - join/create cards
  - friend battle room cards
  - cleaner leaderboard detail page

- Login/Register now use the same branded glass card style.

## Notes

- No database schema change.
- Existing instant check-in and realtime streak fixes are preserved.
- ASP.NET version is already using this design, so it was left unchanged.
