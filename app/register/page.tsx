import Link from "next/link";
import { registerAction } from "@/app/actions";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="auth-page">
      <section className="auth-card glass-card">
        <div className="auth-brand-mark">
          <span className="logo-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
        </div>
        <p className="eyebrow">Start cozy</p>
        <h1>Create HabitHug</h1>
        <p className="auth-subtitle">Your SQL-managed starter habits will appear after signup.</p>
        <AuthForm mode="register" action={registerAction} />
        <div className="auth-alt auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </section>
    </main>
  );
}
