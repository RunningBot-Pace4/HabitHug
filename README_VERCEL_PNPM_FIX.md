# Vercel npm install fix

This project avoids the Vercel `npm error Exit handler never called!` issue by using pnpm through Corepack.

Vercel settings:
- Root Directory: this folder
- Node.js Version: 22.x
- Install Command:
  corepack enable && corepack prepare pnpm@10.24.0 --activate && pnpm install --no-frozen-lockfile
- Build Command:
  pnpm run build

Environment variables:
- DATABASE_URL = Neon pooled connection string
- DIRECT_URL = Neon direct connection string
- SESSION_SECRET = long random string

Important:
- package-lock.json is intentionally removed.
- Do not commit node_modules, .next, .vercel, .vs.
