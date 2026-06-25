import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";
import { compactGridDates, parseDateOnly, todayUtc, toDateOnlyString } from "@/lib/dates";

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

  const boardDates = compactGridDates(126);
  const boardStart = parseDateOnly(boardDates[0]);
  const boardEnd = parseDateOnly(boardDates[boardDates.length - 1]);
  const todayText = toDateOnlyString(todayUtc());

  const rows = await Promise.all(room.members.map(async (member: any) => {
    const [completions, activityLogs] = await Promise.all([
      prisma.habitLog.count({
        where: {
          userId: member.userId,
          isCompleted: true,
          logDate: { gte: room.startDate, lte: room.endDate }
        }
      }),
      prisma.habitLog.findMany({
        where: {
          userId: member.userId,
          isCompleted: true,
          logDate: { gte: boardStart, lte: boardEnd }
        },
        select: { logDate: true }
      })
    ]);

    const points = member.user.rewardBadges.reduce((sum: number, item: any) => sum + item.badge.points, 0);
    const completedDates = new Set(activityLogs.map((log: any) => toDateOnlyString(log.logDate)));
    const boardDays = boardDates.map((date) => ({
      date,
      completed: completedDates.has(date),
      today: date === todayText,
      future: date > todayText
    }));

    return {
      user: member.user,
      completions,
      points,
      boardDays,
      boardDone: boardDays.filter((day) => day.completed).length
    };
  }));

  rows.sort((a: any, b: any) => b.completions - a.completions || b.points - a.points);

  const leader = rows[0];
  const totalCompletions = rows.reduce((sum: number, row: any) => sum + row.completions, 0);

  return (
    <main className="app-shell battle-room-page">
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
        <div>
          <span>Leader</span>
          <strong>{leader ? leader.user.name : "—"}</strong>
        </div>
        <div>
          <span>Check-ins</span>
          <strong>{totalCompletions}</strong>
        </div>
        <Link className="add-pill" href="/battle">← Back</Link>
      </section>

      <section className="battle-section-head">
        <div>
          <p className="eyebrow">7-line battle board</p>
          <h2>18 weeks of tiny wins</h2>
          <p>Each row has 7 days. Completed days glow so friends can see momentum at a glance.</p>
        </div>
      </section>

      <section className="battle-board-list" aria-label="Battle activity board">
        {rows.map((row: any, index: number) => (
          <article className="battle-board-card glass-card" key={row.user.id}>
            <header className="battle-board-head">
              <div className="leaderboard-person">
                <span className="rank-medal">{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}</span>
                <div>
                  <h2>{row.user.name}</h2>
                  <p>{row.completions} battle check-ins · {row.points} pts</p>
                </div>
              </div>
              <span className="battle-board-score">{row.boardDone} / 126</span>
            </header>

            <div className="battle-activity-board" aria-label={`${row.user.name} activity over 18 weeks`}>
              {row.boardDays.map((day: any) => (
                <span
                  key={day.date}
                  className={[
                    "battle-board-cell",
                    day.completed ? "done" : "",
                    day.today ? "today" : "",
                    day.future ? "future" : ""
                  ].join(" ")}
                  title={`${day.date}${day.completed ? " completed" : ""}`}
                />
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="battle-section-head">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>Who is winning?</h2>
          <p>Scores count completed check-ins during this battle window. Reward points break ties.</p>
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
