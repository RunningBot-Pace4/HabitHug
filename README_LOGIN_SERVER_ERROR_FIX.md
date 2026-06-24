# Login Server Error Fix

If `/login` shows "This page couldn't load" after submitting a login form, the app server action crashed.

Most common causes on first Vercel + Neon deploy:

1. `DATABASE_URL` is missing or wrong in Vercel.
2. `DIRECT_URL` is missing or wrong in Vercel.
3. Neon database tables were not created yet.
4. `SESSION_SECRET` is missing or shorter than 32 characters.

## Required Vercel env vars

```env
DATABASE_URL=your Neon pooled connection string
DIRECT_URL=your Neon direct connection string
SESSION_SECRET=at-least-32-random-characters
```

## Initialize Neon database locally

Create `.env` locally using the same values, then run:

```bash
yarn install --network-timeout 100000 --ignore-engines
npx prisma generate
yarn db:init
```

This runs:

```bash
prisma db push
prisma db seed
```

After that, register a new account before logging in.
