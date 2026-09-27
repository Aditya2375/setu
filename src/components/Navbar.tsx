"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionUser, onAuthChange, signOut, type SessionUser } from "@/lib/live";
import { supabaseConfigured } from "@/lib/supabase";

export default function Navbar({ active = "" }: { active?: string }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    if (!supabaseConfigured) return;
    getSessionUser().then(setUser);
    return onAuthChange(setUser);
  }, []);
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/feed" className="nav-logo">SE<em>T</em>U</Link>
        <nav className="nav-links">
          <Link href="/feed" className={`nav-link ${active === "feed" ? "active" : ""}`}>Feed</Link>
          <Link href="/leaderboard" className={`nav-link ${active === "board" ? "active" : ""}`}>Board</Link>
          <Link href="/notifications" className={`nav-link ${active === "notif" ? "active" : ""}`}>Alerts</Link>
          {user ? (
            <>
              <Link href={`/profile/${user.username}`} className="nav-link">{user.displayName}</Link>
              <button onClick={() => signOut()} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer" }}>Out</button>
            </>
          ) : (
            <Link href="/login" className={`nav-link ${active === "login" ? "active" : ""}`}>Log in</Link>
          )}
          <Link href="/doubt/new" className="btn btn--accent" style={{ padding: "0.55em 1.1em" }}>+ Ask</Link>
        </nav>
      </div>
    </header>
  );
}
