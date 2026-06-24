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
      <section className="auth-card">
        <div className="auth-logo">🐰</div>
        <h1>Create HabitHug</h1>
        <p>Your SQL-managed starter habits will appear after signup.</p>
        <AuthForm mode="register" action={registerAction} />
        <div className="auth-alt">
          Already have account? <Link href="/login">Log in</Link>
        </div>
      </section>
    </main>
  );
}
