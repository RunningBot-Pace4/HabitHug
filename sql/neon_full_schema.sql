CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- HabitHug Vercel + Neon PostgreSQL schema
-- This file mirrors prisma/schema.prisma and is optional.
-- Recommended production flow: use Prisma migrations.
-- Run in Neon SQL editor only for manual setup.

CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  "passwordHash" text NOT NULL,
  mascot text NOT NULL DEFAULT '🐰',
  "themeColor" text NOT NULL DEFAULT 'pink',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_templates (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  "targetPerWeek" integer NOT NULL DEFAULT 7,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habits (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  "targetPerWeek" integer NOT NULL DEFAULT 7,
  "archivedAt" timestamptz NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "habitId" text NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "logDate" date NOT NULL,
  "isCompleted" boolean NOT NULL DEFAULT true,
  note text NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("habitId", "logDate")
);

CREATE INDEX IF NOT EXISTS ix_habits_user_archived ON habits ("userId", "archivedAt");
CREATE INDEX IF NOT EXISTS ix_habit_logs_user_date ON habit_logs ("userId", "logDate");

CREATE TABLE IF NOT EXISTS reward_badge_definitions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  points integer NOT NULL DEFAULT 10,
  "ruleType" text NOT NULL,
  "ruleValue" integer NOT NULL DEFAULT 1,
  "sortOrder" integer NOT NULL DEFAULT 0,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_reward_badges (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "rewardBadgeId" text NOT NULL REFERENCES reward_badge_definitions(id) ON DELETE CASCADE,
  "unlockedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("userId", "rewardBadgeId")
);

CREATE TABLE IF NOT EXISTS challenge_rooms (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ownerId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🏆',
  description text NOT NULL,
  "joinCode" text NOT NULL UNIQUE,
  "startDate" date NOT NULL,
  "endDate" date NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS challenge_members (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "roomId" text NOT NULL REFERENCES challenge_rooms(id) ON DELETE CASCADE,
  "userId" text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "joinedAt" timestamptz NOT NULL DEFAULT now(),
  UNIQUE ("roomId", "userId")
);

INSERT INTO habit_templates (code, name, description, icon, color, "targetPerWeek", "sortOrder")
VALUES
('SLEEP_8_HOURS', 'Sleep 8 Hours', 'Rest and recharge for a better tomorrow', '😴', 'purple', 7, 10),
('DRINK_WATER', 'Drink Water', '8 glasses / 3 liters a day', '💧', 'blue', 7, 20),
('WORKOUT', 'Workout', 'Move your body and build energy', '💪', 'green', 4, 30),
('BREAKFAST', 'Eat Breakfast', 'Start the day with a proper meal', '🍳', 'yellow', 7, 40),
('LUNCH', 'Eat Lunch', 'Take a real lunch break', '🍱', 'orange', 7, 50),
('DINNER', 'Eat Dinner', 'Finish the day with a balanced dinner', '🍽️', 'pink', 7, 60)
ON CONFLICT (code) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  "targetPerWeek" = excluded."targetPerWeek",
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;

INSERT INTO reward_badge_definitions (code, name, description, icon, points, "ruleType", "ruleValue", "sortOrder")
VALUES
('FIRST_HUG', 'First Hug', 'Complete your first habit.', '💖', 10, 'TOTAL_COMPLETIONS', 1, 10),
('WEEK_GLOW', '7-Day Glow', 'Complete 7 habit check-ins.', '🔥', 30, 'TOTAL_COMPLETIONS', 7, 20),
('COZY_CHAMPION', 'Cozy Champion', 'Complete 100 habit check-ins.', '👑', 100, 'TOTAL_COMPLETIONS', 100, 30),
('BATTLE_SPARK', 'Battle Spark', 'Join your first battle room.', '⚔️', 20, 'BATTLE_JOINED', 1, 40)
ON CONFLICT (code) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  points = excluded.points,
  "ruleType" = excluded."ruleType",
  "ruleValue" = excluded."ruleValue",
  "sortOrder" = excluded."sortOrder",
  "isActive" = true;
