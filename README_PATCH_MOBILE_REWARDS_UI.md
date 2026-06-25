# Patch: Mobile Rewards Page UI Fix

This patch improves the mobile layout for the Rewards pages.

## Vercel + Neon Next.js
Changed:
- app/rewards/page.tsx
- app/rewards/manage/page.tsx
- app/globals.css

Fixes:
- Rewards hero no longer squeezes on mobile.
- Edit rewards button becomes full-width on mobile.
- Reward cards are single-column on small screens.
- Reward management form/list stack cleanly on mobile.
- Long reward code/rule text wraps instead of overflowing.

## ASP.NET Core + MSSQL
Changed:
- wwwroot/css/site.css

Fixes:
- Rewards page header stacks properly on mobile.
- Reward cards become single-column.
- Reward manage rows stack and buttons fit on mobile.

No database changes.
