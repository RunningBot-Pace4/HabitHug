"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions";

type SettingsProfileFormProps = {
  user: {
    name: string;
    email: string;
    mascot: string;
    themeColor: string;
    isAdmin?: boolean;
  };
};

const mascots = ["🐰", "🐻‍❄️", "🐱", "🐼", "🦊", "🐸", "🌸", "⭐"];
const colors = [
  { value: "pink", label: "Berry pink" },
  { value: "purple", label: "Dream purple" },
  { value: "blue", label: "Sky blue" },
  { value: "green", label: "Mint green" },
  { value: "yellow", label: "Sunbeam" },
  { value: "orange", label: "Peach" }
];

export function SettingsProfileForm({ user }: SettingsProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, null);

  return (
    <>
      {pending ? (
        <div className="form-loading-overlay" role="status" aria-live="polite">
          <div className="form-loading-card">
            <div className="loading-logo">⚙️</div>
            <div className="loading-spinner" aria-hidden="true" />
            <h2>Saving your cozy profile...</h2>
            <p>Updating your name, mascot, and dashboard color ✨</p>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="settings-profile-card glass-card" aria-busy={pending}>
        <div className="settings-card-head">
          <span className="settings-mascot-preview">{user.mascot}</span>
          <div>
            <p className="eyebrow">Your profile</p>
            <h2>Make HabitHug feel like you</h2>
            <p>Choose a friendly name, mascot, and dashboard color.</p>
          </div>
        </div>

        {state && typeof state === "object" && "error" in state ? (
          <div className="form-error">{String(state.error)}</div>
        ) : null}
        {state && typeof state === "object" && "success" in state ? (
          <div className="form-success">{String(state.success)}</div>
        ) : null}

        <label className="settings-field">
          <span>Display name</span>
          <input name="name" defaultValue={user.name} required disabled={pending} />
        </label>

        <label className="settings-field">
          <span>Email</span>
          <input value={user.email} readOnly />
          <small>Email is used for login and cannot be changed here yet.</small>
        </label>

        <div className="settings-section">
          <span className="settings-label">Mascot</span>
          <div className="mascot-picker" role="radiogroup" aria-label="Choose mascot">
            {mascots.map((mascot) => (
              <label className="mascot-choice" key={mascot}>
                <input
                  type="radio"
                  name="mascot"
                  value={mascot}
                  defaultChecked={user.mascot === mascot}
                  disabled={pending}
                />
                <span>{mascot}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <span className="settings-label">Dashboard color</span>
          <div className="dashboard-color-picker" role="radiogroup" aria-label="Choose dashboard color">
            {colors.map((color) => (
              <label className={`dashboard-color-choice color-${color.value}`} key={color.value}>
                <input
                  type="radio"
                  name="themeColor"
                  value={color.value}
                  defaultChecked={user.themeColor === color.value}
                  disabled={pending}
                />
                <span aria-hidden="true" />
                <strong>{color.label}</strong>
              </label>
            ))}
          </div>
        </div>

        <button className="primary-btn loading-btn settings-save-btn" disabled={pending}>
          {pending && <span className="btn-spinner" aria-hidden="true" />}
          {pending ? "Saving..." : "Save profile"}
        </button>

        {user.isAdmin ? (
          <p className="admin-note">Admin mode is on. You can manage rewards and badge rules 🛠️</p>
        ) : (
          <p className="admin-note">Reward tools are hidden for normal users, so the app stays simple 💛</p>
        )}
      </form>
    </>
  );
}
