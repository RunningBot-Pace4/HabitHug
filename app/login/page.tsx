import Link from "next/link";
import { loginAction } from "@/app/actions";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="auth-page">
      <section className="auth-card glass-card">
        <div className="auth-brand-mark">
          <span className="logo-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1>Log in</h1>
        <p className="auth-subtitle">Jump back into your cozy habit cards and keep today’s tiny wins glowing.</p>
        <AuthForm mode="login" action={loginAction} />
        <div className="auth-alt auth-switch">
          New here? <Link href="/register">Create account</Link>
        </div>
      </section>
    </main>
  );
}
