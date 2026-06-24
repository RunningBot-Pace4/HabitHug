import Link from "next/link";
import { redirect } from "next/navigation";
import { HabitForm } from "@/components/HabitForm";
import { getCurrentUser } from "@/lib/session";

export default async function NewHabitPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">➕</div><div><h1>Add habit</h1><p>Design a new cute habit card.</p></div></div>
        <Link className="secondary-btn" href="/">Back</Link>
      </header>
      <HabitForm />
    </main>
  );
}
