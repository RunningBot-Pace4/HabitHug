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

  const loadingTitle = isRegister ? "Creating your cozy space..." : "Logging you in...";
  const loadingText = isRegister ? "Preparing your starter habits." : "Checking your habits and rewards.";

  return (
    <>
      {pending ? (
        <div className="form-loading-overlay" role="status" aria-live="polite" aria-label={loadingTitle}>
          <div className="form-loading-card">
            <div className="loading-logo">🌸</div>
            <div className="loading-spinner" aria-hidden="true" />
            <h2>{loadingTitle}</h2>
            <p>{loadingText}</p>
          </div>
        </div>
      ) : null}

      <form action={formAction} className="auth-form" aria-busy={pending}>
        {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

        {isRegister && (
          <label>
            <span>Name</span>
            <input name="name" type="text" placeholder="Your cute name" required disabled={pending} />
          </label>
        )}

        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" required disabled={pending} />
        </label>

        <label>
          <span>Password</span>
          <input name="password" type="password" placeholder="••••••••" minLength={6} required disabled={pending} />
        </label>

        <button className="primary-btn loading-btn" disabled={pending}>
          {pending ? <span className="btn-spinner" aria-hidden="true" /> : null}
          {pending ? (isRegister ? "Creating..." : "Logging in...") : isRegister ? "Create account" : "Log in"}
        </button>
      </form>
    </>
  );
}
