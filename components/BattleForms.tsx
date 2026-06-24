"use client";

import { useActionState } from "react";
import { createBattleAction, joinBattleAction } from "@/app/actions";

export function CreateBattleForm({ start, end }: { start: string; end: string }) {
  const [state, formAction, pending] = useActionState(createBattleAction, null);

  return (
    <form action={formAction} className="battle-form">
      {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}

      <div className="battle-form-grid">
        <label className="span-2">
          <span>Name</span>
          <input name="name" defaultValue="Weekly Wellness Battle" required />
        </label>
        <label>
          <span>Emoji</span>
          <input name="emoji" defaultValue="🏆" required />
        </label>
        <label className="span-3">
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

      <button className="primary-btn" disabled={pending}>{pending ? "Creating..." : "Create battle"}</button>
    </form>
  );
}

export function JoinBattleForm() {
  const [state, formAction, pending] = useActionState(joinBattleAction, null);

  return (
    <form action={formAction} className="join-form">
      {state && typeof state === "object" && "error" in state && <div className="form-error">{String(state.error)}</div>}
      <label>
        <span>Join code</span>
        <input name="joinCode" placeholder="ABC123" required />
      </label>
      <button className="secondary-btn" disabled={pending}>{pending ? "Joining..." : "Join battle"}</button>
    </form>
  );
}
