"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { fetchNotifications, markNotificationsRead, getSessionUser, type LiveNotif } from "@/lib/live";

const demoAlerts: LiveNotif[] = [
  { kind: "new_advice", text: "Dev Patil advised on: How much do 3rd year internships actually care about CGPA?", ago: "12m", unread: true, doubtId: null },
  { kind: "milestone", text: "Your advice on the guitar doubt crossed 20 ratings - 4.7★ average.", ago: "2h", unread: true, doubtId: null },
  { kind: "new_doubt", text: "New doubt in #football: Football trials next week - what do selectors watch for?", ago: "8h", unread: false, doubtId: null },
  { kind: "accepted", text: "Rohan Iyer accepted Arjun Mehta's advice on the competitive programming doubt.", ago: "1d", unread: false, doubtId: null },
  { kind: "new_doubt", text: "New doubt in #life: Feel like I picked the wrong branch. Anyone else?", ago: "1d", unread: false, doubtId: null },
];

export default function Notifications() {
  const [alerts, setAlerts] = useState<LiveNotif[]>(demoAlerts);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    getSessionUser().then((u) => {
      setSignedIn(!!u);
      if (!u) return;
      fetchNotifications().then((n) => {
        if (n) {
          setAlerts(n);
          markNotificationsRead();
        }
      });
    });
  }, []);
  return (
    <>
      <Navbar active="notif" />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <p className="label" style={{ marginTop: "1.5rem" }}>alerts</p>
        {signedIn === false && (
          <p className="note" style={{ marginTop: "0.75rem" }}>
            <Link href="/login" style={{ color: "var(--accent)" }}>log in</Link> for your own alerts - these are what they look like.
          </p>
        )}
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--line)" }}>
          {alerts.map((n, i) => (
            <div key={i} className="card" style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", marginBottom: 1, alignItems: "baseline" }}>
              <span className="mono" style={{ fontSize: "0.6rem", color: n.unread ? "var(--accent)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", flex: "none", width: "7.5ch" }}>
                {n.kind.replace("_", " ")}
              </span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: n.unread ? "var(--text)" : "var(--muted)" }}>
                {n.doubtId ? <Link href={`/doubt/${n.doubtId}`} style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 3 }}>{n.text}</Link> : n.text}
              </p>
              <span className="mono" style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--muted)", flex: "none" }}>{n.ago}</span>
            </div>
          ))}
          {alerts.length === 0 && <p className="note" style={{ marginTop: "1rem" }}>quiet so far. post or follow a doubt and the alerts come to you.</p>}
        </div>
      </main>
    </>
  );
}
