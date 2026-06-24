"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">⚠️</div>
        <h1>Something went wrong</h1>
        <p>
          The app server hit an error. Most first-deploy errors are caused by missing
          Neon environment variables or database tables not created yet.
        </p>
        <button className="primary-btn" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </main>
  );
}
