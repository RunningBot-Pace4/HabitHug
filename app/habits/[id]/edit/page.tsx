import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { archiveHabitAction } from "@/app/actions";
import { HabitForm } from "@/components/HabitForm";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LoadingSubmitButton } from "@/components/LoadingSubmitButton";

export default async function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const habit = await prisma.habit.findFirst({ where: { id, userId: user.id, archivedAt: null } });
  if (!habit) notFound();

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">{habit.icon}</div><div><h1>Edit habit</h1><p>Customize design how you like it.</p></div></div>
        <Link className="secondary-btn" href="/">Back</Link>
      </header>
      <HabitForm habit={habit} />
      <form action={archiveHabitAction} style={{ marginTop: 16 }}>
        <input type="hidden" name="id" value={habit.id} />
        <LoadingSubmitButton className="secondary-btn loading-btn" style={{ width: "100%" }} pendingText="Archiving..." message="Archiving habit..." helper="Keeping your history safe while hiding this habit 🗂️">Archive habit</LoadingSubmitButton>
      </form>
    </main>
  );
}
