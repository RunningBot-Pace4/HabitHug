import Link from "next/link";

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Link href="/">✅<span>Habits</span></Link>
      <Link href="/rewards">⭐<span>Rewards</span></Link>
      <Link href="/battle">🏆<span>Battle</span></Link>
      <Link href="/settings">⚙️<span>Settings</span></Link>
    </nav>
  );
}
