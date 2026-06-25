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

  const unlockedCount = rewards.filter((reward: any) => reward.users.length > 0).length;
  const totalPoints = rewards
    .filter((reward: any) => reward.users.length > 0)
    .reduce((sum: number, reward: any) => sum + reward.points, 0);

  return (
    <main className="app-shell rewards-page-shell">
      <section className="rewards-hero glass-card">
        <div className="rewards-hero-copy">
          <div className="reward-mascot">🎁</div>
          <div>
            <p className="eyebrow">Tiny prizes</p>
            <h1>Reward Garden</h1>
            <p>Collect cozy badges as your habits grow. Every tiny hug counts ✨</p>
            {user.isAdmin ? <span className="reward-admin-pill">Admin badge tools enabled 🛠️</span> : null}
          </div>
        </div>

        <div className="rewards-hero-side">
          <div className="reward-score-card">
            <strong>{unlockedCount}/{rewards.length}</strong>
            <span>badges unlocked</span>
          </div>
          <div className="reward-score-card">
            <strong>{totalPoints}</strong>
            <span>cozy points</span>
          </div>
          {user.isAdmin ? <Link className="secondary-btn reward-manage-link" href="/rewards/manage">Edit rewards</Link> : null}
        </div>
      </section>

      <section className="reward-grid-deluxe" aria-label="Reward badges">
        {rewards.map((reward: any) => {
          const unlocked = reward.users.length > 0;
          return (
            <article className={`reward-card-deluxe glass-card ${unlocked ? "is-unlocked" : "is-locked"}`} key={reward.id}>
              <div className="reward-card-top">
                <div className="reward-card-icon">{reward.icon}</div>
                <span className="reward-status-pill">{unlocked ? "Unlocked ✨" : "Locked"}</span>
              </div>
              <h2>{reward.name}</h2>
              <p>{reward.description || "Keep going and this badge will bloom soon."}</p>
              <div className="reward-card-foot">
                <span>{reward.points} pts</span>
                <small>{unlocked ? "Your mascot is proud 💛" : "Keep growing 🌱"}</small>
              </div>
            </article>
          );
        })}
      </section>
      <BottomNav />
    </main>
  );
}
