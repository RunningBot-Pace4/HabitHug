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
  weeklyDone: number;
  yearCompletions: number;
  monthPercent: number;
  todayCompleted: boolean;
  completedDates: string[];
  days: GridDay[];
};

type ToggleStatsResponse = {
  completed?: boolean;
  isCompleted?: boolean;
};

type HabitFeedProps = {
  habits: HabitCardData[];
  dayStreak: number;
  totalPoints: number;
};

type ToastMessage = {
  id: number;
  tone: "info" | "success" | "error";
  message: string;
};

const CHECKIN_LOCK_MESSAGE =
  "Check-ins are only open for today and yesterday 🌱 Older days are locked to keep progress fair.";

function addDays(dateText: string, amount: number) {
  const date = new Date(`${dateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function calculateStats(completedDatesArray: string[], todayDate: string | undefined, targetPerWeek: number) {
  const completedDates = new Set(completedDatesArray);

  let currentStreak = 0;
  if (todayDate) {
    let cursor = todayDate;
    while (completedDates.has(cursor)) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }
  }

  const sortedDates = [...completedDates].sort();
  let bestStreak = 0;
  let run = 0;
  let previousDate: string | null = null;

  for (const date of sortedDates) {
    if (previousDate && addDays(previousDate, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }

    bestStreak = Math.max(bestStreak, run);
    previousDate = date;
  }

  const weekStart = todayDate ? addDays(todayDate, -6) : "";
  const weeklyDone = todayDate
    ? sortedDates.filter((date) => date >= weekStart && date <= todayDate).length
    : 0;
  const yearCompletions = todayDate
    ? sortedDates.filter((date) => date.slice(0, 4) === todayDate.slice(0, 4)).length
    : sortedDates.length;
  const monthCompleted = todayDate
    ? sortedDates.filter((date) => date.slice(0, 7) === todayDate.slice(0, 7)).length
    : 0;
  const todayDay = todayDate ? Number(todayDate.slice(8, 10)) : 1;
  const monthPercent = Math.round((monthCompleted * 100) / Math.max(1, todayDay));

  return {
    currentStreak,
    bestStreak,
    totalCompletions: completedDates.size,
    weeklyDone: Math.min(weeklyDone, Math.max(targetPerWeek, weeklyDone)),
    yearCompletions,
    monthPercent,
    todayCompleted: todayDate ? completedDates.has(todayDate) : false
  };
}

function withLocalCheckinState(habit: HabitCardData, logDate: string, completed: boolean): HabitCardData {
  const completedSet = new Set(habit.completedDates);

  if (completed) {
    completedSet.add(logDate);
  } else {
    completedSet.delete(logDate);
  }

  const completedDates = [...completedSet].sort();
  const days = habit.days.map((day) =>
    day.date === logDate ? { ...day, completed } : day
  );
  const todayDate = habit.days.find((day) => day.today)?.date;
  const stats = calculateStats(completedDates, todayDate, habit.targetPerWeek);

  return {
    ...habit,
    ...stats,
    completedDates,
    days
  };
}

function calculateDayStreakFromItems(items: HabitCardData[]) {
  const completedDates = new Set<string>();
  let todayDate: string | undefined;

  for (const habit of items) {
    todayDate = todayDate ?? habit.days.find((day) => day.today)?.date;
    for (const date of habit.completedDates) completedDates.add(date);
  }

  if (!todayDate) return 0;

  let streak = 0;
  let cursor = todayDate;
  while (completedDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function HabitFeed({ habits, dayStreak, totalPoints }: HabitFeedProps) {
  const [items, setItems] = useState(habits);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Check-ins are optimistic and client-owned until the next page load.
  // The API receives the final desired state (completed=true/false), not "toggle",
  // so late server responses cannot re-tick an item the user just unticked.
  const itemsRef = useRef(habits);
  const requestVersionRef = useRef<Record<string, number>>({});
  const desiredCompletedRef = useRef<Record<string, boolean>>({});
  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const inFlightRef = useRef<Record<string, boolean>>({});
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string, tone: ToastMessage["tone"] = "info") {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ id: Date.now(), message, tone });
    toastTimerRef.current = setTimeout(() => setToast(null), 3600);
  }

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
          showToast(CHECKIN_LOCK_MESSAGE, "info");
        }
        return;
      }

      const result = (await res.json()) as ToggleStatsResponse;
      const serverCompleted =
        typeof result.isCompleted === "boolean"
          ? result.isCompleted
          : typeof result.completed === "boolean"
            ? result.completed
            : completed;

      if (requestVersionRef.current[key] !== requestVersion) return;

      if (serverCompleted !== completed) {
        showToast("Oops, that check-in did not sync. Please tap once more 💛", "error");
      }
    } catch {
      if (requestVersionRef.current[key] === requestVersion) {
        showToast("Oops, I couldn’t save that check-in. Please try again in a moment 💛", "error");
      }
    } finally {
      inFlightRef.current[key] = false;

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
    }, 90);
  }

  function toggle(habitId: string, logDate: string) {
    const key = `${habitId}:${logDate}`;
    const target = itemsRef.current.find((h) => h.id === habitId);
    const day = target?.days.find((d) => d.date === logDate);

    if (!target || !day || day.locked) return;

    const nextCompleted = !day.completed;

    const nextItems = itemsRef.current.map((habit) =>
      habit.id === habitId ? withLocalCheckinState(habit, logDate, nextCompleted) : habit
    );

    commitItems(nextItems);
    queueServerSet(key, habitId, logDate, nextCompleted);
  }

  const completedToday = useMemo(() => items.filter((h) => h.todayCompleted).length, [items]);
  const liveDayStreak = useMemo(() => calculateDayStreakFromItems(items), [items]);
  const progressPercent = items.length === 0 ? 0 : Math.round((completedToday * 100) / items.length);

  return (
    <>
      {toast ? (
        <div className={`cute-toast ${toast.tone}`} role="status" aria-live="polite">
          <span>{toast.tone === "error" ? "💛" : toast.tone === "success" ? "✨" : "🌱"}</span>
          <p>{toast.message}</p>
        </div>
      ) : null}
      <section className="feed-summary" aria-label="Today summary">
        <div className="summary-bubble">
          <span>🔥</span>
          <strong>{liveDayStreak}</strong>
          <small>day streak</small>
        </div>
        <div className="summary-bubble">
          <span>✅</span>
          <strong>{completedToday}/{items.length}</strong>
          <small>today</small>
        </div>
        <div className="summary-bubble">
          <span>🌱</span>
          <strong>{progressPercent}%</strong>
          <small>today progress</small>
        </div>
        <div className="summary-bubble">
          <span>⭐</span>
          <strong>{totalPoints}</strong>
          <small>points</small>
        </div>
      </section>

      <section className="cute-progress-panel" aria-label="Today progress">
        <div className="cute-progress-copy">
          <strong>Today’s tiny hugs</strong>
          <span>{completedToday === items.length && items.length > 0 ? "All done — your habits feel loved ✨" : "Tap a chip when a tiny win is done 💛"}</span>
        </div>
        <div className="feed-progress-track" aria-hidden="true">
          <i style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      <section className="quick-check-row" aria-label="Today quick check-in">
        {items.map((habit) => {
          const today = habit.days.find((d) => d.today);
          return (
            <button
              key={habit.id}
              className={`today-quick-chip ${habit.color} ${habit.todayCompleted ? "done" : "pending"}`}
              disabled={!today}
              onClick={() => {
                if (today) toggle(habit.id, today.date);
              }}
            >
              <span className="quick-icon">{habit.icon}</span>
              <strong>{habit.name}</strong>
              <em>{habit.todayCompleted ? "✓" : "＋"}</em>
            </button>
          );
        })}
      </section>

      {items.length === 0 ? (
        <section className="empty-state glass-card card-feed-empty">
          <span>🌱</span>
          <h2>No habits yet</h2>
          <p>Start with one tiny routine and let the grid grow beautifully.</p>
          <a className="add-pill" href="/habits/new">Create first habit</a>
        </section>
      ) : null}

      <section className="habit-card-feed" aria-label="Habit visual grid feed">
        {items.map((habit) => {
          const today = habit.days.find((d) => d.today);
          return (
            <article
              key={habit.id}
              className={`habit-feed-card ${habit.color} ${habit.todayCompleted ? "completed" : ""}`}
              data-habit-card
            >
              <span className="habit-sparkle" aria-hidden="true">{habit.todayCompleted ? "💖" : "✨"}</span>
              <header className="habit-feed-head">
                <a className="habit-feed-title" href={`/habits/${habit.id}`}>
                  <span className="habit-feed-icon">{habit.icon}</span>
                  <div>
                    <h2>{habit.name}</h2>
                    <p>{habit.description || "Tiny habit, big hug."}</p>
                  </div>
                </a>

                <div className="habit-card-actions">
                  <button
                    type="button"
                    className={`habit-cute-status ${habit.todayCompleted ? "done" : "pending"}`}
                    aria-label={`Toggle today for ${habit.name}`}
                    disabled={!today}
                    onClick={() => {
                      if (today) toggle(habit.id, today.date);
                    }}
                  >
                    <span>{habit.todayCompleted ? "✓" : "♡"}</span>
                  </button>
                </div>
              </header>

              <div className="habit-feed-grid-wrap">
                <div className="habit-feed-grid" aria-label={`${habit.name} recent activity`}>
                  {habit.days.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      className={[
                        "grid-pixel",
                        day.completed ? "done" : "",
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
              </div>

              <footer className="habit-feed-meta">
                <span className="hug-pill"><strong>{habit.todayCompleted ? "Hugged" : "Open"}</strong> today</span>
                <span><strong>{habit.currentStreak}</strong> streak</span>
                <span><strong>{habit.bestStreak}</strong> best</span>
                <span><strong>{habit.weeklyDone}</strong>/{habit.targetPerWeek} week</span>
                <span><strong>{habit.yearCompletions}</strong> year</span>
                <span><strong>{habit.totalCompletions}</strong> total</span>
                <span><strong>{habit.monthPercent}%</strong> month</span>
                <a className="feed-edit-link" href={`/habits/${habit.id}/edit`}>Edit</a>
              </footer>
            </article>
          );
        })}
      </section>
    </>
  );
}
