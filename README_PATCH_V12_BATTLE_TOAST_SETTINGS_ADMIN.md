# HabitHug Patch V12 — Battle Board, Toasts, Settings, Admin

This patch adds:

- 18 weeks x 7 rows dashboard grids for habit cards.
- New Battle room 7-line board for each player.
- Cute toast feedback instead of browser alert popups.
- Real Settings profile editing:
  - display name
  - mascot
  - dashboard color
- Rewards page polish.
- Reward admin tools hidden from normal users.
- Admin protection on reward management pages and server actions.

## Database update

This patch adds one field:

```prisma
User.isAdmin Boolean @default(false)
```

Run:

```bash
npx prisma generate
npx prisma db push
```

## Make yourself admin

Option A: set env variable before register/login:

```env
ADMIN_EMAILS="your-email@example.com"
```

Option B: run this in Neon SQL editor after registering:

```sql
UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

Normal users cannot see `/rewards/manage` and cannot call reward create/delete server actions.
