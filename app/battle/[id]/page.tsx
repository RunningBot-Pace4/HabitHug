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
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">{room.emoji}</div><div><h1>{room.name}</h1><p>{room.description}</p></div></div>
        <Link className="secondary-btn" href="/battle">Back</Link>
      </header>

      <section className="room-card">
        <p>Share this join code with friends:</p>
        <span className="join-code">{room.joinCode}</span>
      </section>

      <section className="leaderboard">
        {rows.map((row: any, index: number) => (
          <div className="rank-row" key={row.user.id}>
            <div className="rank-medal">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</div>
            <div>
              <strong>{row.user.name}</strong>
              <p style={{ margin: "4px 0 0", color: "var(--muted)", fontWeight: 800 }}>{row.completions} habit check-ins</p>
            </div>
            <strong>{row.points} pts</strong>
          </div>
        ))}
      </section>
      <BottomNav />
    </main>
  );
}
