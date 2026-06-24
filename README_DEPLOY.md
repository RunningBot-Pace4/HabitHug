# HabitHug Vercel + Neon Git-Ready Setup

This folder is the correct code set for the Vercel + Neon version.

## What to upload to GitHub

Upload this folder only:

```text
HabitHug_Vercel_Neon_GIT_READY
```

Do not upload:

```text
node_modules
.next
.env
.vercel
.vs
```

These are already ignored by `.gitignore`.

## Neon environment variables

Create a Neon PostgreSQL database named `HabitHug`.

In Neon → Connect, copy:

```env
DATABASE_URL="pooled connection string, usually has -pooler in host"
DIRECT_URL="direct connection string, no -pooler in host"
SESSION_SECRET="long random secret"
```

Use database name `/HabitHug` in both URLs.

## Local first-time setup

```bash
corepack enable
corepack prepare pnpm@10.24.0 --activate
pnpm install
cp .env.example .env
pnpm db:deploy
pnpm db:seed
pnpm dev
```

If this is a brand-new Neon DB and migration deploy fails, use:

```bash
pnpm db:push
pnpm db:seed
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial HabitHug Vercel Neon app"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

## Vercel settings

When importing the GitHub repo:

```text
Framework Preset: Next.js
Root Directory: folder that contains package.json
Install Command: corepack enable && corepack prepare pnpm@10.24.0 --activate && pnpm install --no-frozen-lockfile
Build Command: pnpm run build
Output Directory: keep default
Node.js Version: 22.x
```

Add environment variables in Vercel:

```env
DATABASE_URL=your Neon pooled URL
DIRECT_URL=your Neon direct URL
SESSION_SECRET=your long random secret
ENABLE_EXPERIMENTAL_COREPACK=1
```

Then deploy.

## After deployment

Open the production URL, register a new user, and the app will create starter habits from SQL data in `habit_templates`.

## Current feature set

- Cute responsive habit card feed
- Login/register
- SQL-managed starter habit templates
- Habit completion no-refresh toggle
- Reward management
- Battle rooms with private join code
- Neon PostgreSQL + Prisma
- Vercel-ready pnpm install configuration
