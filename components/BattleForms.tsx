"use client";

import { useActionState } from "react";
import { createBattleAction, joinBattleAction } from "@/app/actions";

export function CreateBattleForm({ start, end }: { start: string; end: string }) {
  const [state, formAction, pending] = useActionState(createBattleAction, null);

  return (
    <form action={formAction} className="battle-form" aria-busy={pending}>
      {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}

      <div className="battle-form-grid">
        <div className="battle-title-row">
          <label className="name-field">
            <span>Name</span>
            <input name="name" defaultValue="Weekly Wellness Battle" required disabled={pending} />
          </label>

          <label className="emoji-field">
            <span>Emoji</span>
            <input name="emoji" defaultValue="🏆" required maxLength={4} disabled={pending} />
          </label>
        </div>

        <label className="full-field">
          <span>Description</span>
          <input name="description" defaultValue="Complete habits with friends and see who wins." disabled={pending} />
        </label>

        <div className="battle-date-row">
          <label className="date-field">
            <span>Start</span>
            <input className="pretty-date-input" name="startDate" type="date" defaultValue={start} required disabled={pending} />
          </label>

          <label className="date-field">
            <span>End</span>
            <input className="pretty-date-input" name="endDate" type="date" defaultValue={end} required disabled={pending} />
          </label>
        </div>
      </div>

      <button className="primary-btn loading-btn battle-submit-btn" disabled={pending}>
        {pending && <span className="btn-spinner" aria-hidden="true" />}
        {pending ? "Creating battle..." : "Create battle"}
      </button>
    </form>
  );
}

export function JoinBattleForm() {
  const [state, formAction, pending] = useActionState(joinBattleAction, null);

  return (
    <form action={formAction} className="join-form" aria-busy={pending}>
      {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}
      <label>
        <span>Join code</span>
        <input name="joinCode" placeholder="ABC123" required disabled={pending} />
      </label>
      <button className="secondary-btn loading-btn" disabled={pending}>
        {pending && <span className="btn-spinner" aria-hidden="true" />}
        {pending ? "Joining battle..." : "Join battle"}
      </button>
    </form>
  );
}
