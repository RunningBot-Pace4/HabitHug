import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";
import { SettingsProfileForm } from "@/components/SettingsProfileForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className={`app-shell dashboard-color-${user.themeColor}`}>
      <section className="settings-hero glass-card">
        <div className="settings-hero-copy">
          <span className="settings-hero-icon">{user.mascot}</span>
          <div>
            <p className="eyebrow">Cozy control room</p>
            <h1>Settings</h1>
            <p>Edit your profile, pick your mascot, and color your dashboard.</p>
          </div>
        </div>
        {user.isAdmin ? <span className="admin-badge">Admin 🛠️</span> : <span className="admin-badge soft">Member 💛</span>}
      </section>

      <SettingsProfileForm user={{
        name: user.name,
        email: user.email,
        mascot: user.mascot,
        themeColor: user.themeColor,
        isAdmin: user.isAdmin
      }} />

      <BottomNav />
    </main>
  );
}
