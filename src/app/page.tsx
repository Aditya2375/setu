import Link from "next/link";
import { demoDoubts } from "@/lib/demo";

export default function Landing() {
  const open = demoDoubts.filter((d) => !d.solved).length;
  const mostWatched = [...demoDoubts].sort((a, b) => b.follows - a.follows)[0];
  return (
    <main className="wrap" style={{ maxWidth: 900 }}>
      <p className="label" style={{ marginTop: "4rem" }}>setu // the bridge</p>

      <div style={{ position: "relative" }}>
        <h1 className="hero-title" style={{ margin: "1rem 0", maxWidth: "12ch" }}>
          Ask anything.<br />Get advice that's <em>rated</em><br />worth hearing.
        </h1>
        <span className="stamp" style={{ position: "absolute", top: "0.4rem", right: "8%" }}>
          est. somewhere between midnight & 4 AM
        </span>
      </div>

      <p style={{ color: "var(--muted)", maxWidth: "46ch", fontSize: "1.05rem" }}>
        Juniors post doubts - academics, music, football, hostel life, anything on campus.
        Seniors answer. The community scores every answer, the best advice rises,
        the noise sinks. That's the whole idea.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap", alignItems: "center" }}>
        <Link href="/feed" className="btn btn--accent chamfer">Enter the bridge</Link>
        <Link href="/leaderboard" className="btn--ghost btn chamfer">Top advisors</Link>
        <span className="note" style={{ marginLeft: "0.5rem" }}>
          anonymous if you want. your CR will never know.
        </span>
      </div>

      <p className="note" style={{ marginTop: "3rem" }}>
        right now: {open} open doubts - most-watched is "{mostWatched.title.length > 44 ? mostWatched.title.slice(0, 44) + "…" : mostWatched.title}" ({mostWatched.follows} following)
      </p>

      <div style={{ marginTop: "2.5rem" }}>
        {[
          ["01", "ASK", "Post under your name or quietly. Some things are easier asked quietly."],
          ["02", "ANSWER", "Seniors and peers who know the ground reply with real advice, not gyaan."],
          ["03", "RATE", "Every answer gets 1-5 stars from the community. Profiles carry the record."],
          ["04", "RISE", "Good advice floats. Consistently bad advice takes a timeout."],
        ].map(([n, t, d]) => (
          <div key={n} className="rule-row">
            <span className="rule-num">{n}</span>
            <div>
              <p className="label" style={{ fontSize: "0.65rem", margin: 0 }}>{t}</p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0.35rem 0 0", maxWidth: "52ch" }}>{d}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="note" style={{ marginTop: "2rem" }}>
        answers are rated by people with nothing to gain. that's the whole trick.
      </p>

      <hr className="hairline hairline--dash" style={{ margin: "3.5rem 0 1.25rem" }} />
      <p className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", letterSpacing: "0.06em" }}>
        setu (सेतु) — n. bridge. built by a junior who got tired of advice that wasn't.
      </p>
    </main>
  );
}
