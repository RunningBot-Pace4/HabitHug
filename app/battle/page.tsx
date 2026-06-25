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
      <section className="battle-hero glass-card">
        <div className="battle-hero-copy">
          <p className="eyebrow">Private friend battles</p>
          <h1>Battle rooms 🏆</h1>
          <p>Create a cozy private room, invite friends with a code, and see who keeps the most habits glowing.</p>
        </div>
        <div className="battle-total-pill" aria-label="Your battle rooms">
          <span>My rooms</span>
          <strong>{rooms.length}</strong>
        </div>
      </section>

      <section className="battle-actions" aria-label="Create or join battle">
        <article className="battle-action-card battle-join-card glass-card">
          <div className="battle-card-head">
            <span>💌</span>
            <div>
              <h2>Join battle</h2>
              <p>Paste a friend’s invite code.</p>
            </div>
          </div>
          <JoinBattleForm />
        </article>

        <article className="battle-action-card battle-create-card glass-card">
          <div className="battle-card-head">
            <span>✨</span>
            <div>
              <h2>Create room</h2>
              <p>Start a friendly private battle.</p>
            </div>
          </div>
          <CreateBattleForm start={dates.start} end={dates.end} />
        </article>
      </section>

      <section className="battle-section-head">
        <div>
          <p className="eyebrow">Your rooms</p>
          <h2>Friend battles</h2>
          <p>Only invited members can see the leaderboard.</p>
        </div>
      </section>

      {rooms.length === 0 ? (
        <section className="empty-state glass-card">
          <span>🏡</span>
          <h2>No battle room yet</h2>
          <p>Create one and share the code, or join a friend’s room.</p>
        </section>
      ) : (
        <section className="battle-room-grid" aria-label="Battle rooms">
          {rooms.map((room: any) => (
            <Link href={`/battle/${room.id}`} className="battle-room-card glass-card" key={room.id}>
              <div className="battle-room-top">
                <span className="battle-room-emoji">{room.emoji}</span>
                <span className="battle-status active">Live</span>
              </div>

              <h2>{room.name}</h2>
              <p>{room.description}</p>

              <div className="battle-room-stats">
                <span><strong>{room.members.length}</strong> players</span>
                <span><strong>{room.joinCode}</strong> code</span>
                <span><strong>→</strong> open</span>
              </div>

              <div className="battle-room-foot">
                <span>Private room</span>
                <b>Open →</b>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="battle-note glass-card">
        <strong>How Battle works</strong>
        <p>Only room members are ranked. Score is completed habit check-ins between the battle start and end dates. Reward points break ties.</p>
      </section>

      <BottomNav />
    </main>
  );
}
