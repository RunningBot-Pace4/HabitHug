import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { createMissingStarterHabits } from "@/lib/bootstrap";
import { addDays, compactGridDates, todayUtc, toDateOnlyString } from "@/lib/dates";
import { bestStreak, completedDateSet, currentStreak, totalPoints } from "@/lib/stats";
import { HabitFeed } from "@/components/HabitFeed";
import { BottomNav } from "@/components/BottomNav";
import { LoadingSubmitButton } from "@/components/LoadingSubmitButton";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await createMissingStarterHabits(user.id);

  const gridDates = compactGridDates(156);
  const today = todayUtc();
  const todayText = toDateOnlyString(today);
  const yesterdayText = toDateOnlyString(addDays(today, -1));

  const habits = await prisma.habit.findMany({
    where: { userId: user.id, archivedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      logs: true
    }
  });

  const badges = await prisma.userRewardBadge.findMany({
    where: { userId: user.id },
    include: { badge: true }
  });

  const accountCompletedDates = new Set<string>();
  for (const habit of habits) {
    for (const log of habit.logs) {
      if (log.isCompleted) {
        accountCompletedDates.add(toDateOnlyString(log.logDate));
      }
    }
  }

  const cards = habits.map((habit: any) => {
    const set = completedDateSet(habit.logs);
    const completedDates = [...set].sort();
    const monthCompleted = completedDates.filter((date) => date.slice(0, 7) === todayText.slice(0, 7)).length;
    const weeklyDone = completedDates.filter((date) => date >= toDateOnlyString(addDays(today, -6)) && date <= todayText).length;
    const yearCompletions = completedDates.filter((date) => date.slice(0, 4) === todayText.slice(0, 4)).length;
    const monthPercent = today.getUTCDate() === 0 ? 0 : Math.round((monthCompleted * 100) / today.getUTCDate());

    return {
      id: habit.id,
      name: habit.name,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      targetPerWeek: habit.targetPerWeek,
      currentStreak: currentStreak(set),
      bestStreak: bestStreak(set),
      totalCompletions: set.size,
      weeklyDone,
      yearCompletions,
      monthPercent,
      todayCompleted: set.has(todayText),
      completedDates,
      days: gridDates.map((date) => ({
        date,
        completed: set.has(date),
        today: date === todayText,
        future: date > todayText,
        locked: date < yesterdayText || date > todayText
      }))
    };
  });

  return (
    <>
      <header className="top-app-bar">
        <Link className="compact-brand" href="/">
          <span className="logo-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <span>HabitHug</span>
        </Link>

        <nav className="top-nav-links" aria-label="Main navigation">
          <Link href="/">Habits</Link>
          <Link href="/battle">Battle</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <div className="account-pill">
          <span className="account-avatar">{user.mascot}</span>
          <span className="account-name">{user.name}</span>
          <form action={logoutAction}>
            <LoadingSubmitButton className="account-logout-btn" pendingText="…" message="Logging you out..." helper="Closing your cozy session safely 💛">
              Log out
            </LoadingSubmitButton>
          </form>
        </div>
      </header>

      <main className="app-shell">
        <section className="feed-hero cute-hero">
          <div className="cute-hero-copy">
            <p className="eyebrow">Tiny hugs, daily wins</p>
            <h1>Hi {user.name}! {user.mascot}</h1>
            <p>Build your cozy streak one gentle check-in at a time. Today and yesterday are open so progress stays fair.</p>
          </div>

          <div className="hero-mascot-card" aria-label="HabitHug mascot message">
            <span className="hero-mascot" aria-hidden="true">🐻‍❄️</span>
            <div>
              <strong>Your buddy is cheering!</strong>
              <small>Tap a cute card, collect tiny wins, and keep your week glowing.</small>
            </div>
            <Link className="add-pill hero-add-pill" href="/habits/new">＋ Add habit</Link>
          </div>
        </section>

        <HabitFeed
          habits={cards}
          dayStreak={currentStreak(accountCompletedDates)}
          totalPoints={totalPoints(badges)}
        />

        <BottomNav />
      </main>
    </>
  );
}
