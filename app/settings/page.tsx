import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">⚙️</div><div><h1>Settings</h1><p>Profile and preferences.</p></div></div>
      </header>

      <section className="editor-card">
        <label><span>Name</span><input value={user.name} readOnly /></label>
        <label><span>Email</span><input value={user.email} readOnly /></label>
        <p style={{ color: "var(--muted)", fontWeight: 800 }}>Profile editing can be added next in both versions.</p>
      </section>
      <BottomNav />
    </main>
  );
}
