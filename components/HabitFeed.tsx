"use client";

import { useMemo, useRef, useState } from "react";

type GridDay = {
  date: string;
  completed: boolean;
  today: boolean;
  future: boolean;
  locked: boolean;
};

type HabitCardData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  targetPerWeek: number;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  todayCompleted: boolean;
  days: GridDay[];
};

type ToggleStatsResponse = {
  completed?: boolean;
  isCompleted?: boolean;
  currentStreak?: number;
  bestStreak?: number;
  totalCompletions?: number;
  todayCompleted?: boolean;
};

const CHECKIN_LOCK_MESSAGE =
  "Check-ins are only open for today and yesterday 🌱 Older days are locked to keep progress fair.";

function addDays(dateText: string, amount: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function liveStats(days: GridDay[], previousBest: number) {
  const completedDates = new Set(days.filter((day) => day.completed).map((day) => day.date));
  const today = days.find((day) => day.today)?.date;

  let currentStreak = 0;
  if (today) {
    let cursor = today;
    while (completedDates.has(cursor)) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const sortedDates = [...completedDates].sort();
  let bestVisibleStreak = 0;
  let run = 0;
  let previousDate: string | null = null;

  for (const date of sortedDates) {
    if (previousDate && addDays(previousDate, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }

    bestVisibleStreak = Math.max(bestVisibleStreak, run);
    previousDate = date;
  }

  return {
    currentStreak,
    // Keep old all-time best while still allowing a new live streak to increase it instantly.
    bestStreak: Math.max(previousBest, bestVisibleStreak),
    totalCompletions: completedDates.size,
    todayCompleted: today ? completedDates.has(today) : false
  };
}

function applyServerStats(
  habit: HabitCardData,
  logDate: string,
  response: ToggleStatsResponse
): HabitCardData {
  const completed =
    typeof response.isCompleted === "boolean"
      ? response.isCompleted
      : typeof response.completed === "boolean"
        ? response.completed
        : undefined;

  const days =
    completed === undefined
      ? habit.days
      : habit.days.map((day) => (day.date === logDate ? { ...day, completed } : day));

  const optimistic = liveStats(days, habit.bestStreak);

  return {
    ...habit,
    days,
    currentStreak:
      typeof response.currentStreak === "number" ? response.currentStreak : optimistic.currentStreak,
    bestStreak: typeof response.bestStreak === "number" ? response.bestStreak : optimistic.bestStreak,
    totalCompletions:
      typeof response.totalCompletions === "number"
        ? response.totalCompletions
        : optimistic.totalCompletions,
    todayCompleted:
      typeof response.todayCompleted === "boolean" ? response.todayCompleted : optimistic.todayCompleted
  };
}

export function HabitFeed({ habits }: { habits: HabitCardData[] }) {
  const [items, setItems] = useState(habits);

  // Check-in should feel instant. We update the UI immediately and batch rapid taps.
  // Example: tick → untick quickly sends either one server toggle or no request if the taps cancel out.
  const pendingToggleCountsRef = useRef<Record<string, number>>({});
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function queueServerToggle(key: string, habitId: string, logDate: string) {
    pendingToggleCountsRef.current[key] = (pendingToggleCountsRef.current[key] ?? 0) + 1;

    if (pendingTimersRef.current[key]) {
      clearTimeout(pendingTimersRef.current[key]);
    }

    pendingTimersRef.current[key] = setTimeout(async () => {
      const tapCount = pendingToggleCountsRef.current[key] ?? 0;
      pendingToggleCountsRef.current[key] = 0;
      delete pendingTimersRef.current[key];

      // Even number of quick taps returns to the original state, so no server change is needed.
      if (tapCount % 2 === 0) return;

      try {
        const res = await fetch("/api/habits/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ habitId, logDate })
        });

        if (!res.ok) {
          alert(CHECKIN_LOCK_MESSAGE);
          window.location.reload();
          return;
        }

        const result = (await res.json()) as ToggleStatsResponse;

        // Reconcile quietly with server totals/streaks. The user already saw the instant update.
        setItems((prev) =>
          prev.map((habit) =>
            habit.id === habitId ? applyServerStats(habit, logDate, result) : habit
          )
        );
      } catch {
        alert("Oops, I couldn’t save that check-in. Please try again in a moment 💛");
        window.location.reload();
      }
    }, 220);
  }

  function toggle(habitId: string, logDate: string) {
    const target = items.find((h) => h.id === habitId);
    const day = target?.days.find((d) => d.date === logDate);
    const key = `${habitId}:${logDate}`;

    if (!target || !day || day.locked) return;

    // Instant optimistic UI update. Stats update at the same time as the square.
    setItems((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;

        const wasCompleted = habit.days.find((day) => day.date === logDate)?.completed ?? false;
        const nextDays = habit.days.map((d) =>
          d.date === logDate ? { ...d, completed: !d.completed } : d
        );
        const stats = liveStats(nextDays, habit.bestStreak);

        return {
          ...habit,
          ...stats,
          totalCompletions: Math.max(0, habit.totalCompletions + (wasCompleted ? -1 : 1)),
          days: nextDays
        };
      })
    );

    queueServerToggle(key, habitId, logDate);
  }

  const completedToday = useMemo(() => items.filter((h) => h.todayCompleted).length, [items]);

  return (
    <>
      <section className="today-strip">
        <div>
          <p className="eyebrow">Today</p>
          <h2>{completedToday}/{items.length} done</h2>
        </div>
        <div className="quick-chips">
          {items.map((habit) => {
            const today = habit.days.find((d) => d.today);
            return (
              <button
                key={habit.id}
                className={`quick-chip ${habit.todayCompleted ? "done" : ""}`}
                disabled={!today}
                onClick={() => {
                  if (today) toggle(habit.id, today.date);
                }}
              >
                <span>{habit.icon}</span>
                {habit.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="habit-feed">
        {items.map((habit) => {
          const today = habit.days.find((d) => d.today);
          return (
            <article key={habit.id} className={`habit-card color-${habit.color}`}>
              <div className="habit-card-head">
                <div className="habit-icon">{habit.icon}</div>
                <a className="habit-title-link" href={`/habits/${habit.id}`}>
                  <h3>{habit.name}</h3>
                  <p>{habit.description}</p>
                </a>
                <button
                  className={["check-btn", habit.todayCompleted ? "done" : ""].join(" ")}
                  aria-label={`Toggle today for ${habit.name}`}
                  disabled={!today}
                  onClick={() => {
                    if (today) toggle(habit.id, today.date);
                  }}
                >
                  ✓
                </button>
              </div>

              <div className="mini-grid" aria-label={`${habit.name} progress grid`}>
                {habit.days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    className={[
                      "mini-cell",
                      day.completed ? "completed" : "",
                      day.today ? "today" : "",
                      day.future ? "future" : "",
                      day.locked ? "locked" : ""
                    ].join(" ")}
                    disabled={day.locked}
                    title={day.locked ? CHECKIN_LOCK_MESSAGE : day.date}
                    onClick={() => toggle(habit.id, day.date)}
                  >
                    <span className="sr-only">{day.date}</span>
                  </button>
                ))}
              </div>

              <div className="card-footer">
                <span>🔥 {habit.currentStreak} streak</span>
                <span>🏆 {habit.bestStreak} best</span>
                <span>✅ {habit.totalCompletions} done</span>
                <a href={`/habits/${habit.id}/edit`}>Edit</a>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}
