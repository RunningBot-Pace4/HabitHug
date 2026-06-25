import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { addDays, parseDateOnly, todayUtc, toDateOnlyString } from "@/lib/dates";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const habitId = String(body.habitId ?? "");
  const logDateText = String(body.logDate ?? "");
  const today = todayUtc();
  const todayText = toDateOnlyString(today);
  const yesterdayText = toDateOnlyString(addDays(today, -1));

  if (!habitId || !/^\d{4}-\d{2}-\d{2}$/.test(logDateText)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (logDateText < yesterdayText || logDateText > todayText) {
    return NextResponse.json({ error: "Check-ins are only open for today and yesterday 🌱 Older days are locked to keep progress fair." }, { status: 400 });
  }

  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId: user.id, archivedAt: null } });
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const logDate = parseDateOnly(logDateText);
  const existing = await prisma.habitLog.findUnique({
    where: { habitId_logDate: { habitId, logDate } }
  });

  let completed = true;

  if (!existing) {
    await prisma.habitLog.create({
      data: { habitId, userId: user.id, logDate, isCompleted: true }
    });
  } else {
    completed = !existing.isCompleted;
    await prisma.habitLog.update({
      where: { id: existing.id },
      data: { isCompleted: completed }
    });
  }

  const count = await prisma.habitLog.count({ where: { userId: user.id, isCompleted: true } });
  const badge = await prisma.rewardBadgeDefinition.findFirst({
    where: { ruleType: "TOTAL_COMPLETIONS", ruleValue: { lte: count }, isActive: true },
    orderBy: { ruleValue: "desc" }
  });

  if (badge) {
    await prisma.userRewardBadge.upsert({
      where: { userId_rewardBadgeId: { userId: user.id, rewardBadgeId: badge.id } },
      update: {},
      create: { userId: user.id, rewardBadgeId: badge.id }
    });
  }

  return NextResponse.json({ completed });
}
