-- HabitHug V12 patch for existing Neon databases

ALTER TABLE users
ADD COLUMN IF NOT EXISTS "isAdmin" boolean NOT NULL DEFAULT false;

-- Optional: promote your own account to admin.
-- UPDATE users SET "isAdmin" = true WHERE email = 'your-email@example.com';
