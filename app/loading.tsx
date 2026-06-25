export default function Loading() {
  return (
    <main className="loading-page" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-logo">💖</div>
        <div className="loading-spinner" aria-hidden="true" />
        <h1>Loading HabitHug...</h1>
        <p>Preparing your tiny wins ✨</p>
      </div>
    </main>
  );
}
