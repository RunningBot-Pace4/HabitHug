"use client";

import { useActionState } from "react";
import { saveHabitAction } from "@/app/actions";

const icons = ["💧", "😴", "💪", "🍳", "🍱", "🍽️", "📚", "🧘", "🏃", "🎸", "🪴", "☕", "💊", "🧹", "📝"];
const colors = ["pink", "purple", "blue", "green", "yellow", "orange", "mint"];

type HabitValue = {
  id?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  targetPerWeek?: number;
};

export function HabitForm({ habit }: { habit?: HabitValue }) {
  const [state, formAction, pending] = useActionState(saveHabitAction, null);

  return (
    <form action={formAction} className="editor-card">
      {state && typeof state === "object" && "error" in state && (
        <div className="form-error">{String(state.error)}</div>
      )}

      {habit?.id && <input type="hidden" name="id" value={habit.id} />}

      <label>
        <span>Name</span>
        <input name="name" defaultValue={habit?.name ?? ""} placeholder="Reading" required />
      </label>

      <label>
        <span>Description</span>
        <input name="description" defaultValue={habit?.description ?? ""} placeholder="Read for 15 minutes" />
      </label>

      <label>
        <span>Weekly target</span>
        <select name="targetPerWeek" defaultValue={habit?.targetPerWeek ?? 7}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>{n} / week</option>
          ))}
        </select>
      </label>

      <div>
        <span className="field-label">Icon</span>
        <div className="picker-grid">
          {icons.map((icon) => (
            <label key={icon} className="picker-chip">
              <input type="radio" name="icon" value={icon} defaultChecked={(habit?.icon ?? "💧") === icon} />
              <span>{icon}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="field-label">Color</span>
        <div className="color-grid">
          {colors.map((color) => (
            <label key={color} className={`color-dot color-${color}`}>
              <input type="radio" name="color" value={color} defaultChecked={(habit?.color ?? "blue") === color} />
              <span>{color}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="primary-btn" disabled={pending}>
        {pending ? "Saving..." : "Save habit"}
      </button>
    </form>
  );
}
