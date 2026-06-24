import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createMissingStarterHabits } from "@/lib/bootstrap";
import { compactGridDates, parseDateOnly, todayUtc, toDateOnlyString } from "@/lib/dates";
import { bestStreak, completedDateSet, currentStreak } from "@/lib/stats";
import { HabitFeed } from "@/components/HabitFeed";
import { BottomNav } from "@/components/BottomNav";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await createMissingStarterHabits(user.id);

  const gridDates = compactGridDates(126);
  const startDate = parseDateOnly(gridDates[0]);
  const todayText = toDateOnlyString(todayUtc());

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      logs: {
        where: { logDate: { gte: startDate } }
      }
    }
  });

  const cards = habits.map((habit: any) => {
    const set = completedDateSet(habit.logs);
    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      targetPerWeek: habit.targetPerWeek,
      currentStreak: currentStreak(set),
      bestStreak: bestStreak(set),
      totalCompletions: habit.logs.filter((log: any) => log.isCompleted).length,
      todayCompleted: set.has(todayText),
      days: gridDates.map((date) => ({
        date,
        completed: set.has(date),
        today: date === todayText,
        future: date > todayText
      }))
    };
  });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-bubble">{user.mascot}</div>
          <div>
            <h1>HabitHug</h1>
            <p>Hi {user.name}, tiny wins today ✨</p>
          </div>
        </div>
        <div className="header-actions">
          <Link className="icon-btn" href="/habits/new">＋</Link>
          <form action={logoutAction}><button className="icon-btn">↪</button></form>
        </div>
      </header>

      <HabitFeed habits={cards} />
      <BottomNav />
    </main>
  );
}
