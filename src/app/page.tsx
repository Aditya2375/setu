import Link from "next/link";

export default function Landing() {
  return (
    <main className="wrap" style={{ maxWidth: 860 }}>
      <p className="label" style={{ marginTop: "4rem" }}>setu // the bridge</p>
      <h1 className="hero-title" style={{ margin: "1rem 0" }}>
        Ask anything.<br />Get advice that's <em>rated</em><br />worth hearing.
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "46ch", fontSize: "1.05rem" }}>
        Juniors post doubts - academics, music, football, hostel life, anything on campus.
        Seniors answer. The community scores every answer, the best advice rises,
        the noise sinks. That's the whole idea.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <Link href="/feed" className="btn btn--accent chamfer">Enter the bridge</Link>
        <Link href="/leaderboard" className="btn btn--ghost chamfer">Top advisors</Link>
      </div>
      <hr className="hairline" style={{ margin: "3.5rem 0 2rem" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "var(--line)" }}>
        {[
          ["01 / ASK", "Post under your name or anonymously. Some things are easier asked quietly."],
          ["02 / ANSWER", "Seniors and peers who know the ground reply with real advice, not gyaan."],
          ["03 / RATE", "Every answer gets 1-5 stars from the community. Profiles carry the record."],
          ["04 / RISE", "Great advice floats to the top. Consistently bad advice takes a timeout."],
        ].map(([t, d]) => (
          <div key={t} className="card chamfer-bl" style={{ padding: "1.25rem" }}>
            <p className="label" style={{ fontSize: "0.65rem" }}>{t}</p>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.5rem" }}>{d}</p>
          </div>
        ))}
      </div>
    </main>
  );
}