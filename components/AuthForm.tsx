"use client";

import { useActionState } from "react";

type Props = {
  mode: "login" | "register";
  action: (state: unknown, formData: FormData) => Promise<{ error?: string } | void>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const isRegister = mode === "register";
  const errorMessage =
    state && typeof state === "object" && "error" in state
      ? String((state as { error?: string }).error ?? "")
      : "";

  return (
    <form action={formAction} className="auth-form">
      {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

      {isRegister && (
        <label>
          <span>Name</span>
          <input name="name" type="text" placeholder="Your cute name" required />
        </label>
      )}

      <label>
        <span>Email</span>
        <input name="email" type="email" placeholder="you@example.com" required />
      </label>

      <label>
        <span>Password</span>
        <input name="password" type="password" placeholder="••••••••" minLength={6} required />
      </label>

      <button className="primary-btn" disabled={pending}>
        {pending ? "Please wait..." : isRegister ? "Create account" : "Log in"}
      </button>
    </form>
  );
}
