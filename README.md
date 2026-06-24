# HabitHug

Cute habit tracker built with Next.js App Router, Vercel, Neon PostgreSQL, and Prisma.

Use `README_DEPLOY.md` for the exact GitHub + Vercel + Neon setup steps.

## Quick start

```bash
corepack enable
corepack prepare pnpm@10.24.0 --activate
pnpm install
cp .env.example .env
pnpm db:deploy
pnpm db:seed
pnpm dev
```
