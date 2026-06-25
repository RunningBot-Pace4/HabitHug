import Link from "next/link";
import { redirect } from "next/navigation";
import { saveRewardDirectAction, deleteRewardAction } from "@/app/actions";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { LoadingSubmitButton } from "@/components/LoadingSubmitButton";

export default async function ManageRewardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rewards = await prisma.rewardBadgeDefinition.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <main className="app-shell rewards-page-shell">
      <section className="rewards-hero glass-card reward-manage-hero">
        <div className="rewards-hero-copy">
          <div className="reward-mascot">🛠️</div>
          <div>
            <p className="eyebrow">Badge builder</p>
            <h1>Edit Rewards</h1>
            <p>Add, tune, or remove the cute badges users can unlock from their habit activity.</p>
          </div>
        </div>
        <Link className="secondary-btn reward-manage-link" href="/rewards">Back to rewards</Link>
      </section>

      <section className="reward-manage-layout">
        <form action={saveRewardDirectAction} className="editor-card reward-editor-card">
          <h2>Add reward</h2>
          <p className="reward-editor-help">Create a badge rule. It will be saved in Neon Postgres ⭐</p>

          <label>
            <span>Code</span>
            <input name="code" placeholder="NEW_BADGE" required />
          </label>
          <label>
            <span>Name</span>
            <input name="name" placeholder="Badge name" required />
          </label>
          <label>
            <span>Description</span>
            <input name="description" placeholder="Short cute description" />
          </label>

          <div className="reward-form-row">
            <label>
              <span>Icon</span>
              <input name="icon" placeholder="🏆" required />
            </label>
            <label>
              <span>Points</span>
              <input name="points" type="number" placeholder="Points" defaultValue={10} />
            </label>
          </div>

          <label>
            <span>Rule type</span>
            <input name="ruleType" placeholder="TOTAL_COMPLETIONS" defaultValue="TOTAL_COMPLETIONS" />
          </label>

          <div className="reward-form-row">
            <label>
              <span>Rule value</span>
              <input name="ruleValue" type="number" placeholder="Rule value" defaultValue={1} />
            </label>
            <label>
              <span>Sort order</span>
              <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={100} />
            </label>
          </div>

          <label className="reward-active-toggle">
            <input type="checkbox" name="isActive" defaultChecked />
            <span>Active badge</span>
          </label>
          <LoadingSubmitButton pendingText="Adding reward..." message="Adding reward..." helper="Saving this badge into Neon Postgres ⭐">Add reward</LoadingSubmitButton>
        </form>

        <div className="reward-list-stack">
          {rewards.map((reward: any) => (
            <article className="reward-manage-row glass-card" key={reward.id}>
              <div className="reward-manage-row-main">
                <span className="reward-card-icon">{reward.icon}</span>
                <div>
                  <h3>{reward.name}</h3>
                  <p>{reward.description || "No description yet."}</p>
                  <small>{reward.code} · {reward.ruleType} ≥ {reward.ruleValue} · {reward.points} pts</small>
                </div>
              </div>
              <form action={deleteRewardAction} className="reward-delete-form">
                <input type="hidden" name="id" value={reward.id} />
                <LoadingSubmitButton className="secondary-btn loading-btn reward-delete-btn" pendingText="Deleting..." message="Deleting reward..." helper="Removing this badge definition safely 🧹">Delete</LoadingSubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
