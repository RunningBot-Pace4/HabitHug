-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "mascot" TEXT NOT NULL DEFAULT '🐰',
    "themeColor" TEXT NOT NULL DEFAULT 'pink',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_templates" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "targetPerWeek" INTEGER NOT NULL DEFAULT 7,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "habit_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "targetPerWeek" INTEGER NOT NULL DEFAULT 7,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" DATE NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_badge_definitions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "ruleType" TEXT NOT NULL,
    "ruleValue" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reward_badge_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reward_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rewardBadgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_reward_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_rooms" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '🏆',
    "description" TEXT NOT NULL,
    "joinCode" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "challenge_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_members" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "challenge_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "habit_templates_code_key" ON "habit_templates"("code");
CREATE INDEX "habits_userId_archivedAt_idx" ON "habits"("userId", "archivedAt");
CREATE UNIQUE INDEX "habit_logs_habitId_logDate_key" ON "habit_logs"("habitId", "logDate");
CREATE INDEX "habit_logs_userId_logDate_idx" ON "habit_logs"("userId", "logDate");
CREATE UNIQUE INDEX "reward_badge_definitions_code_key" ON "reward_badge_definitions"("code");
CREATE UNIQUE INDEX "user_reward_badges_userId_rewardBadgeId_key" ON "user_reward_badges"("userId", "rewardBadgeId");
CREATE UNIQUE INDEX "challenge_rooms_joinCode_key" ON "challenge_rooms"("joinCode");
CREATE INDEX "challenge_rooms_ownerId_idx" ON "challenge_rooms"("ownerId");
CREATE UNIQUE INDEX "challenge_members_roomId_userId_key" ON "challenge_members"("roomId", "userId");
CREATE INDEX "challenge_members_userId_idx" ON "challenge_members"("userId");

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_reward_badges" ADD CONSTRAINT "user_reward_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_reward_badges" ADD CONSTRAINT "user_reward_badges_rewardBadgeId_fkey" FOREIGN KEY ("rewardBadgeId") REFERENCES "reward_badge_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_rooms" ADD CONSTRAINT "challenge_rooms_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_members" ADD CONSTRAINT "challenge_members_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "challenge_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "challenge_members" ADD CONSTRAINT "challenge_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
