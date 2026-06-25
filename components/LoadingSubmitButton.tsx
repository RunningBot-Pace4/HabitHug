"use client";

import type { CSSProperties, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type Props = {
  children: ReactNode;
  pendingText?: string;
  message?: string;
  helper?: string;
  className?: string;
  type?: "submit" | "button";
  style?: CSSProperties;
};

export function LoadingSubmitButton({
  children,
  pendingText = "Saving...",
  message = "Saving your changes...",
  helper = "Just a moment while HabitHug updates everything ✨",
  className = "primary-btn loading-btn",
  type = "submit",
  style
}: Props) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <div className="form-loading-overlay" role="status" aria-live="polite" aria-label={message}>
          <div className="form-loading-card">
            <div className="loading-logo">💖</div>
            <div className="loading-spinner" aria-hidden="true" />
            <h2>{message}</h2>
            <p>{helper}</p>
          </div>
        </div>
      ) : null}

      <button type={type} className={className} style={style} disabled={pending}>
        {pending ? <span className="btn-spinner" aria-hidden="true" /> : null}
        {pending ? pendingText : children}
      </button>
    </>
  );
}
