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
      <section className="auth-card">
        <div className="auth-logo">🌸</div>
        <h1>Welcome back</h1>
        <p>Log in and hug your habits for today.</p>
        <AuthForm mode="login" action={loginAction} />
        <div className="auth-alt">
          New here? <Link href="/register">Create account</Link>
        </div>
      </section>
    </main>
  );
}
