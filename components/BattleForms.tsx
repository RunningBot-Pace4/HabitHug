"use client";

import { useActionState } from "react";
import { createBattleAction, joinBattleAction } from "@/app/actions";

export function CreateBattleForm({ start, end }: { start: string; end: string }) {
  const [state, formAction, pending] = useActionState(createBattleAction, null);

  return (
    <form action={formAction} className="battle-form" aria-busy={pending}>
      {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}

      <div className="battle-form-grid">
        <label className="name-field">
          <span>Name</span>
          <input name="name" defaultValue="Weekly Wellness Battle" required />
        </label>
        <label className="emoji-field">
          <span>Emoji</span>
          <input name="emoji" defaultValue="🏆" required maxLength={4} />
        </label>
        <label className="full-field">
          <span>Description</span>
          <input name="description" defaultValue="Complete habits with friends and see who wins." />
        </label>
        <label>
          <span>Start</span>
          <input name="startDate" type="date" defaultValue={start} required />
        </label>
        <label>
          <span>End</span>
          <input name="endDate" type="date" defaultValue={end} required />
        </label>
      </div>

      <button className="primary-btn loading-btn" disabled={pending}>
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
        <input name="joinCode" placeholder="ABC123" required />
      </label>
      <button className="secondary-btn loading-btn" disabled={pending}>
        {pending && <span className="btn-spinner" aria-hidden="true" />}
        {pending ? "Joining battle..." : "Join battle"}
      </button>
    </form>
  );
}
