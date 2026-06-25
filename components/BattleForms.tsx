"use client";

import { useActionState } from "react";
import { createBattleAction, joinBattleAction } from "@/app/actions";

export function CreateBattleForm({ start, end }: { start: string; end: string }) {
  const [state, formAction, pending] = useActionState(createBattleAction, null);

  return (
    <>
      {pending ? (
        <div className="form-loading-overlay" role="status" aria-live="polite" aria-label="Creating battle">
          <div className="form-loading-card">
            <div className="loading-logo">🏆</div>
            <div className="loading-spinner" aria-hidden="true" />
            <h2>Creating your battle room...</h2>
            <p>Preparing the leaderboard and invite code ✨</p>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="battle-create-form" aria-busy={pending}>
        {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}

        <div className="battle-form-grid">
          <label className="battle-field-name">
            <span>Name</span>
            <input name="name" defaultValue="Weekly Wellness Battle" required disabled={pending} />
          </label>

          <label className="battle-field-emoji">
            <span>Emoji</span>
            <input name="emoji" defaultValue="🏆" required maxLength={4} disabled={pending} />
          </label>

          <label className="battle-field-description">
            <span>Description</span>
            <input name="description" defaultValue="Complete habits with friends and see who wins." disabled={pending} />
          </label>

          <label className="battle-field-start">
            <span>Start</span>
            <input className="pretty-date-input" name="startDate" type="date" defaultValue={start} required disabled={pending} />
          </label>

          <label className="battle-field-end">
            <span>End</span>
            <input className="pretty-date-input" name="endDate" type="date" defaultValue={end} required disabled={pending} />
          </label>
        </div>

        <button className="battle-primary-button loading-btn" disabled={pending}>
          {pending && <span className="btn-spinner" aria-hidden="true" />}
          {pending ? "Creating battle..." : "Create battle"}
        </button>
      </form>
    </>
  );
}

export function JoinBattleForm() {
  const [state, formAction, pending] = useActionState(joinBattleAction, null);

  return (
    <>
      {pending ? (
        <div className="form-loading-overlay" role="status" aria-live="polite" aria-label="Joining battle">
          <div className="form-loading-card">
            <div className="loading-logo">🔐</div>
            <div className="loading-spinner" aria-hidden="true" />
            <h2>Joining battle...</h2>
            <p>Checking your private invite code 🏆</p>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="battle-join-form" aria-busy={pending}>
        {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}
        <label className="sr-only" htmlFor="joinCode">Join code</label>
        <input id="joinCode" name="joinCode" placeholder="ABC123XY" maxLength={16} required disabled={pending} />
        <button className="loading-btn" disabled={pending}>
          {pending && <span className="btn-spinner" aria-hidden="true" />}
          {pending ? "Joining..." : "Join"}
        </button>
      </form>
    </>
  );
}
