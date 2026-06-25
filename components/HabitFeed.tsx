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

  // Check-ins should feel instant and stable.
  // We update the UI immediately, then save the desired final state in the background.
  // Requests for the same day are sent in order so an older slow response cannot tick a box back on.
  const itemsRef = useRef(habits);
  const requestVersionRef = useRef<Record<string, number>>({});
  const desiredCompletedRef = useRef<Record<string, boolean>>({});
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const inFlightRef = useRef<Record<string, boolean>>({});

  function commitItems(nextItems: HabitCardData[]) {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }

  async function flushServerSet(key: string, habitId: string, logDate: string) {
    if (inFlightRef.current[key]) return;

    const completed = desiredCompletedRef.current[key];
    if (typeof completed !== "boolean") return;

    const requestVersion = requestVersionRef.current[key] ?? 0;
    inFlightRef.current[key] = true;

    try {
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, logDate, completed })
      });

      if (!res.ok) {
        if (requestVersionRef.current[key] === requestVersion) {
          alert(CHECKIN_LOCK_MESSAGE);
        }
        return;
      }

      const result = (await res.json()) as ToggleStatsResponse;

      // If the user tapped again while this request was running, do not apply this old response.
      // Send the newest desired state after this request finishes.
      if (requestVersionRef.current[key] !== requestVersion) return;

      const serverCompleted =
        typeof result.isCompleted === "boolean"
          ? result.isCompleted
          : typeof result.completed === "boolean"
            ? result.completed
            : completed;

      if (serverCompleted !== completed) return;

      const nextItems = itemsRef.current.map((habit) =>
        habit.id === habitId ? applyServerStats(habit, logDate, result) : habit
      );
      commitItems(nextItems);
    } catch {
      if (requestVersionRef.current[key] === requestVersion) {
        alert("Oops, I couldn’t save that check-in. Please try again in a moment 💛");
      }
    } finally {
      inFlightRef.current[key] = false;

      // A newer tap happened while this request was in flight. Save the latest desired state now.
      if ((requestVersionRef.current[key] ?? 0) !== requestVersion) {
        void flushServerSet(key, habitId, logDate);
      }
    }
  }

  function queueServerSet(key: string, habitId: string, logDate: string, completed: boolean) {
    requestVersionRef.current[key] = (requestVersionRef.current[key] ?? 0) + 1;
    desiredCompletedRef.current[key] = completed;

    if (pendingTimersRef.current[key]) {
      clearTimeout(pendingTimersRef.current[key]);
    }

    pendingTimersRef.current[key] = setTimeout(() => {
      delete pendingTimersRef.current[key];
      void flushServerSet(key, habitId, logDate);
    }, 120);
  }

  function toggle(habitId: string, logDate: string) {
    const key = `${habitId}:${logDate}`;
    const target = itemsRef.current.find((h) => h.id === habitId);
    const day = target?.days.find((d) => d.date === logDate);

    if (!target || !day || day.locked) return;

    const nextCompleted = !day.completed;

    // Instant optimistic UI update. Stats update at the same time as the square.
    const nextItems = itemsRef.current.map((habit) => {
      if (habit.id !== habitId) return habit;

      const nextDays = habit.days.map((d) =>
        d.date === logDate ? { ...d, completed: nextCompleted } : d
      );
      const stats = liveStats(nextDays, habit.bestStreak);
      const totalDelta = day.completed === nextCompleted ? 0 : nextCompleted ? 1 : -1;

      return {
        ...habit,
        ...stats,
        totalCompletions: Math.max(0, habit.totalCompletions + totalDelta),
        days: nextDays
      };
    });

    commitItems(nextItems);
    queueServerSet(key, habitId, logDate, nextCompleted);
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
