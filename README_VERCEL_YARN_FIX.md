# Vercel install fix: use Yarn Classic

This package avoids the previous npm/Corepack/pnpm install failures on Vercel.

## Vercel settings

Project Settings -> Build and Deployment:

- Framework Preset: Next.js
- Node.js Version: 22.x
- Install Command:
  yarn install --network-timeout 100000 --ignore-engines
- Build Command:
  yarn build

## Environment Variables

Remove this variable if you added it earlier:

- ENABLE_EXPERIMENTAL_COREPACK

Keep these:

- DATABASE_URL = Neon pooled connection string
- DIRECT_URL = Neon direct connection string
- SESSION_SECRET = long random secret

## Redeploy

After pushing this patch, redeploy with Clear Build Cache.
