import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { completedDateSet, currentStreak, bestStreak } from "@/lib/stats";
import { monthCalendar, todayUtc, toDateOnlyString } from "@/lib/dates";
import { BottomNav } from "@/components/BottomNav";

export default async function HabitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const today = todayUtc();
  const cells = monthCalendar(today.getUTCFullYear(), today.getUTCMonth());
  const habit = await prisma.habit.findFirst({
    where: { id, userId: user.id, archivedAt: null },
    include: { logs: true }
  });
  if (!habit) notFound();

  const set = completedDateSet(habit.logs);
  const todayText = toDateOnlyString(today);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">{habit.icon}</div><div><h1>{habit.name}</h1><p>{habit.description}</p></div></div>
        <Link className="secondary-btn" href="/">Back</Link>
      </header>

      <section className="habit-detail-card" style={{ padding: 24 }}>
        <div className="grid-2">
          <div className="stat-pill">🔥 Current streak: {currentStreak(set)}</div>
          <div className="stat-pill">🏆 Best streak: {bestStreak(set)}</div>
          <div className="stat-pill">✅ Total: {set.size}</div>
          <div className="stat-pill">🎯 Target: {habit.targetPerWeek}/week</div>
        </div>

        <h2>{today.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</h2>
        <div className="month-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <strong key={d} style={{ color: "var(--muted)" }}>{d}</strong>)}
          {cells.map((cell, i) => cell.date ? (
            <div key={cell.date} className={`mini-cell ${set.has(cell.date) ? "completed" : ""} ${cell.date === todayText ? "today" : ""}`} style={{ aspectRatio: "1", display: "grid", placeItems: "center", fontWeight: 900 }}>
              {cell.day}
            </div>
          ) : <div key={i} />)}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
