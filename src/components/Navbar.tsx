import Link from "next/link";

export default function Navbar({ active = "", user = null as null | { username: string } }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/feed" className="nav-logo">SE<em>T</em>U</Link>
        <nav className="nav-links">
          <Link href="/feed" className={`nav-link ${active === "feed" ? "active" : ""}`}>Feed</Link>
          <Link href="/leaderboard" className={`nav-link ${active === "board" ? "active" : ""}`}>Board</Link>
          <Link href="/notifications" className={`nav-link ${active === "notif" ? "active" : ""}`}>Alerts</Link>
          <Link href="/doubt/new" className="btn btn--accent" style={{ padding: "0.55em 1.1em" }}>+ Ask</Link>
        </nav>
      </div>
    </header>
  );
}