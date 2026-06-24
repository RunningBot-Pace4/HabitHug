import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateBattleForm, JoinBattleForm } from "@/components/BattleForms";
import { defaultBattleDates } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function BattlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dates = await defaultBattleDates();
  const rooms = await prisma.challengeRoom.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    include: { members: true }
  });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">🏆</div><div><h1>Battle</h1><p>Create friendly private battles with friends.</p></div></div>
      </header>

      <section className="grid-2">
        <article className="battle-create-card">
          <div className="hero" style={{ marginBottom: 18 }}>
            <div className="hero-icon">✨</div>
            <div><h2>Create room</h2><p>Start a friendly private battle.</p></div>
          </div>
          <CreateBattleForm start={dates.start} end={dates.end} />
        </article>

        <article className="battle-create-card">
          <div className="hero" style={{ marginBottom: 18 }}>
            <div className="hero-icon">🔐</div>
            <div><h2>Join battle</h2><p>Enter the code your friend shared.</p></div>
          </div>
          <JoinBattleForm />
        </article>
      </section>

      <h2>Your battle rooms</h2>
      <section className="room-list">
        {rooms.map((room: any) => (
          <Link href={`/battle/${room.id}`} className="room-card" key={room.id}>
            <h3>{room.emoji} {room.name}</h3>
            <p>{room.description}</p>
            <span className="join-code">{room.joinCode}</span>
            <p>{room.members.length} player(s)</p>
          </Link>
        ))}
      </section>
      <BottomNav />
    </main>
  );
}
