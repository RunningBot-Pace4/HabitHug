import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { BottomNav } from "@/components/BottomNav";

export default async function RewardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rewards = await prisma.rewardBadgeDefinition.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      users: { where: { userId: user.id } }
    }
  });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">⭐</div><div><h1>Rewards</h1><p>Unlock cute badges as you progress.</p></div></div>
        <Link className="secondary-btn" href="/rewards/manage">Edit rewards</Link>
      </header>

      <section className="grid-2">
        {rewards.map((reward: any) => (
          <article className="glass-card" style={{ padding: 22 }} key={reward.id}>
            <div className="hero-icon">{reward.icon}</div>
            <h2>{reward.name}</h2>
            <p style={{ color: "var(--muted)", fontWeight: 800 }}>{reward.description}</p>
            <span className="stat-pill">{reward.users.length ? "Unlocked ✨" : `${reward.points} points`}</span>
          </article>
        ))}
      </section>
      <BottomNav />
    </main>
  );
}
