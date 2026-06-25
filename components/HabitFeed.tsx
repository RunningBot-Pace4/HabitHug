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

export function HabitFeed({ habits }: { habits: HabitCardData[] }) {
  const [items, setItems] = useState(habits);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function toggle(habitId: string, logDate: string) {
    const target = items.find((h) => h.id === habitId);
    const day = target?.days.find((d) => d.date === logDate);
    if (!target || !day || day.locked || savingKey) return;

    const key = `${habitId}:${logDate}`;
    setSavingKey(key);

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
        alert("Only yesterday and today can be updated.");
      }
    } catch {
      setItems(habits);
      alert("Could not update this habit. Please try again.");
    } finally {
      setSavingKey(null);
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
          {items.map((habit) => (
            <button
              key={habit.id}
              className={`quick-chip ${habit.todayCompleted ? "done" : ""}`}
              disabled={savingKey !== null}
              onClick={() => {
                const today = habit.days.find((d) => d.today);
                if (today) toggle(habit.id, today.date);
              }}
            >
              <span>{habit.icon}</span>
              {habit.name}
            </button>
          ))}
        </div>
      </section>

      <section className="habit-feed">
        {items.map((habit) => (
          <article key={habit.id} className={`habit-card color-${habit.color}`}>
            <div className="habit-card-head">
              <div className="habit-icon">{habit.icon}</div>
              <a className="habit-title-link" href={`/habits/${habit.id}`}>
                <h3>{habit.name}</h3>
                <p>{habit.description}</p>
              </a>
              <button
                className={[
                  "check-btn",
                  habit.todayCompleted ? "done" : "",
                  savingKey === `${habit.id}:${habit.days.find((d) => d.today)?.date}` ? "saving" : ""
                ].join(" ")}
                aria-label={`Toggle today for ${habit.name}`}
                disabled={savingKey !== null}
                onClick={() => {
                  const today = habit.days.find((d) => d.today);
                  if (today) toggle(habit.id, today.date);
                }}
              >
                {savingKey === `${habit.id}:${habit.days.find((d) => d.today)?.date}` ? "…" : "✓"}
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
                    day.locked ? "locked" : "",
                    savingKey === `${habit.id}:${day.date}` ? "saving" : ""
                  ].join(" ")}
                  disabled={day.locked || savingKey !== null}
                  title={day.locked ? "Only yesterday and today can be updated" : day.date}
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
        ))}
      </section>
    </>
  );
}
