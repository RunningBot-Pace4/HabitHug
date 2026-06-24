# Vercel `npm install` fix

If Vercel fails at `Command "npm install" exited with 1`:

1. Set Vercel Root Directory to this folder, where `package.json` exists.
2. Set Environment Variables in Vercel:
   - `DATABASE_URL`
   - `SESSION_SECRET`
3. Set Node.js version to `22.x` or `20.x`.
4. Redeploy without cache.

Prisma may run client generation during dependency installation, so `DATABASE_URL` must exist in Vercel environment variables before deployment.
