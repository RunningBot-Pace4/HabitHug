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
    <main className="app-shell">
      <header className="app-header">
        <div className="brand"><div className="brand-bubble">🛠️</div><div><h1>Edit rewards</h1><p>Reward definitions are stored in Neon Postgres.</p></div></div>
        <Link className="secondary-btn" href="/rewards">Back</Link>
      </header>

      <section className="grid-2">
        <form action={saveRewardDirectAction} className="editor-card">
          <h2>Add reward</h2>
          <input name="code" placeholder="NEW_BADGE" required />
          <input name="name" placeholder="Badge name" required />
          <input name="description" placeholder="Description" />
          <input name="icon" placeholder="🏆" required />
          <input name="points" type="number" placeholder="Points" defaultValue={10} />
          <input name="ruleType" placeholder="TOTAL_COMPLETIONS" defaultValue="TOTAL_COMPLETIONS" />
          <input name="ruleValue" type="number" placeholder="Rule value" defaultValue={1} />
          <input name="sortOrder" type="number" placeholder="Sort order" defaultValue={100} />
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input style={{ width: "auto" }} type="checkbox" name="isActive" defaultChecked /> Active</label>
          <LoadingSubmitButton pendingText="Adding reward..." message="Adding reward..." helper="Saving this badge into Neon Postgres ⭐">Add reward</LoadingSubmitButton>
        </form>

        <div className="room-list">
          {rewards.map((reward: any) => (
            <article className="room-card" key={reward.id}>
              <h3>{reward.icon} {reward.name}</h3>
              <p>{reward.description}</p>
              <form action={deleteRewardAction}>
                <input type="hidden" name="id" value={reward.id} />
                <LoadingSubmitButton className="secondary-btn loading-btn" pendingText="Deleting..." message="Deleting reward..." helper="Removing this badge definition safely 🧹">Delete</LoadingSubmitButton>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
