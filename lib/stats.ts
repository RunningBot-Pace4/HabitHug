import { HabitLog, RewardBadgeDefinition } from "@prisma/client";
import { addDays, toDateOnlyString, todayUtc } from "@/lib/dates";

export function currentStreak(completedDates: Set<string>): number {
  let streak = 0;
  let cursor = todayUtc();
  while (completedDates.has(toDateOnlyString(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(completedDates: Set<string>): number {
  const sorted = [...completedDates].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const dateText of sorted) {
    const date = new Date(`${dateText}T00:00:00.000Z`);
    if (prev && toDateOnlyString(addDays(prev, 1)) === dateText) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = date;
  }

  return best;
}

export function totalPoints(badges: { badge: RewardBadgeDefinition }[]): number {
  return badges.reduce((sum, item) => sum + item.badge.points, 0);
}

export function completedDateSet(logs: Pick<HabitLog, "logDate" | "isCompleted">[]) {
  return new Set(
    logs
      .filter((log) => log.isCompleted)
      .map((log) => toDateOnlyString(log.logDate))
  );
}
