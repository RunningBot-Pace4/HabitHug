import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function BattleRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const room = await prisma.challengeRoom.findFirst({
    where: { id, members: { some: { userId: user.id } } },
    include: {
      members: {
        include: {
          user: {
            include: {
              rewardBadges: { include: { badge: true } }
            }
          }
        }
      }
    }
  });
  if (!room) notFound();

  const rows = await Promise.all(room.members.map(async (member: any) => {
    const completions = await prisma.habitLog.count({
      where: {
        userId: member.userId,
        isCompleted: true,
        logDate: { gte: room.startDate, lte: room.endDate }
      }
    });
    const points = member.user.rewardBadges.reduce((sum: number, item: any) => sum + item.badge.points, 0);
    return { user: member.user, completions, points };
  }));

  rows.sort((a: any, b: any) => b.completions - a.completions || b.points - a.points);

  return (
    <main className="app-shell">
      <section className="battle-hero glass-card">
        <div className="battle-hero-copy">
          <p className="eyebrow">Private battle room</p>
          <h1>{room.emoji} {room.name}</h1>
          <p>{room.description}</p>
        </div>
        <div className="battle-total-pill" aria-label="Members">
          <span>Players</span>
          <strong>{room.members.length}</strong>
        </div>
      </section>

      <section className="battle-room-toolbar glass-card">
        <div>
          <span>Invite code</span>
          <strong>{room.joinCode}</strong>
        </div>
        <Link className="add-pill" href="/battle">← Back</Link>
      </section>

      <section className="battle-section-head">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>Who is winning?</h2>
          <p>Scores count completed check-ins during this battle window.</p>
        </div>
      </section>

      <section className="leaderboard-list">
        {rows.map((row: any, index: number) => (
          <div className="leaderboard-card glass-card" key={row.user.id}>
            <div className="leaderboard-person">
              <span className="rank-medal">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</span>
              <div>
                <h2>{row.user.name}</h2>
                <p>{row.completions} habit check-ins</p>
              </div>
            </div>
            <strong>{row.points} pts</strong>
          </div>
        ))}
      </section>

      <BottomNav />
    </main>
  );
}
