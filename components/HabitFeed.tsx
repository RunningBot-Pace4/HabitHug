"use client";

import { useMemo, useState } from "react";

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

const CHECKIN_LOCK_MESSAGE =
  "Check-ins are only open for today and yesterday 🌱 Older days are locked to keep progress fair.";

export function HabitFeed({ habits }: { habits: HabitCardData[] }) {
  const [items, setItems] = useState(habits);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  async function toggle(habitId: string, logDate: string) {
    const target = items.find((h) => h.id === habitId);
    const day = target?.days.find((d) => d.date === logDate);
    const key = `${habitId}:${logDate}`;

    if (!target || !day || day.locked || pendingKey === key) return;

    setPendingKey(key);

    // Check-ins are optimistic: update the UI immediately.
    // No full-page loader and no visible "saving" pill for quick taps.

    setItems((prev) =>
      prev.map((h) =>
        h.id !== habitId
          ? h
          : {
              ...h,
              todayCompleted: day.today ? !h.todayCompleted : h.todayCompleted,
              totalCompletions: day.completed ? h.totalCompletions - 1 : h.totalCompletions + 1,
              days: h.days.map((d) => (d.date === logDate ? { ...d, completed: !d.completed } : d))
            }
      )
    );

    try {
      const res = await fetch("/api/habits/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, logDate })
      });

      if (!res.ok) {
        setItems(habits);
        alert(CHECKIN_LOCK_MESSAGE);
      }
    } catch {
      setItems(habits);
      alert("Oops, I couldn’t save that check-in. Please try again in a moment 💛");
    } finally {
      setPendingKey((current) => (current === key ? null : current));
    }
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
            const todayKey = today ? `${habit.id}:${today.date}` : "";
            return (
              <button
                key={habit.id}
                className={`quick-chip ${habit.todayCompleted ? "done" : ""}`}
                disabled={!today || pendingKey === todayKey}
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
          const todayKey = today ? `${habit.id}:${today.date}` : "";
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
                  disabled={!today || pendingKey === todayKey}
                  onClick={() => {
                    if (today) toggle(habit.id, today.date);
                  }}
                >
                  ✓
                </button>
              </div>

              <div className="mini-grid" aria-label={`${habit.name} progress grid`}>
                {habit.days.map((day) => {
                  const dayKey = `${habit.id}:${day.date}`;
                  return (
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
                      disabled={day.locked || pendingKey === dayKey}
                      title={day.locked ? CHECKIN_LOCK_MESSAGE : day.date}
                      onClick={() => toggle(habit.id, day.date)}
                    >
                      <span className="sr-only">{day.date}</span>
                    </button>
                  );
                })}
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
