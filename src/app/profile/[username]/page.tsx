import Link from "next/link";
import Navbar from "@/components/Navbar";
import { personas, demoDoubts, starString } from "@/lib/demo";

export function generateStaticParams() {
  return Object.values(personas).map((p) => ({ username: p.username }));
}

const notes: Record<string, string> = {
  sneha_m: "has talked four people out of quitting CS. so far.",
  dev_bhaiya: "answers internship doubts like it's a full-time job. it is not.",
  arjun_cp: "will rate your advice 2 stars and tell you exactly why.",
  ananya_sings: "music room, 6-8pm. just show up.",
};

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const p = Object.values(personas).find((x) => x.username === username);
  if (!p) {
    return (
      <>
        <Navbar />
        <main className="wrap"><p className="note">no such advisor. the bridge is small, everyone is findable.</p></main>
      </>
    );
  }
  const given = demoDoubts.flatMap((d) =>
    d.advice.filter((a) => a.author.username === username).map((a) => ({ doubt: d, advice: a }))
  );
  const ratings = given.reduce((n, g) => n + g.advice.ratings, 0);
  const avg = given.length ? given.reduce((n, g) => n + g.advice.stars, 0) / given.length : 0;

  return (
    <>
      <Navbar />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginTop: "1.5rem", position: "relative" }}>
          <span className="avatar" style={{ width: 64, height: 64, fontSize: "1.5rem" }}>{p.name[0]}</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem" }}>
              {p.name}
              {p.flair && <span className="tag tag--accent mono" style={{ marginLeft: "0.7rem", fontSize: "0.55rem" }}>trusted</span>}
            </h1>
            <p className="mono" style={{ margin: "0.3rem 0 0", fontSize: "0.7rem", color: "var(--muted)" }}>
              @{p.username} · {p.role}
            </p>
          </div>
          {p.flair && <span className="stamp" style={{ position: "absolute", right: 0, top: "0.5rem" }}>answers land</span>}
        </div>

        {notes[p.username] && <p className="note" style={{ marginTop: "1rem" }}>{notes[p.username]}</p>}

        <div style={{ display: "flex", gap: "1px", background: "var(--line)", margin: "1.5rem 0 2rem", border: "1px solid var(--line)" }}>
          {[
            [given.length.toString(), "advice given"],
            [ratings.toString(), "ratings received"],
            [given.length ? avg.toFixed(1) + "★" : "-", "community average"],
          ].map(([v, l]) => (
            <div key={l} className="card" style={{ flex: 1, padding: "1rem", textAlign: "center", border: "none" }}>
              <p className="mono" style={{ margin: 0, fontSize: "1.3rem", color: "var(--accent)" }}>{v}</p>
              <p className="mono" style={{ margin: "0.2rem 0 0", fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</p>
            </div>
          ))}
        </div>

        <p className="label">advice on the record</p>
        <div style={{ marginTop: "0.75rem", borderTop: "1px solid var(--line)" }}>
          {given.map(({ doubt, advice }) => (
            <Link key={advice.id} href={`/doubt/${doubt.id}`} className="card doubt-card">
              <p className="mono" style={{ margin: 0, fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                on: {doubt.title.length > 56 ? doubt.title.slice(0, 56) + "…" : doubt.title}
              </p>
              <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                {advice.body.length > 140 ? advice.body.slice(0, 140) + "…" : advice.body}
              </p>
              <span className="stars" style={{ fontSize: "0.8rem" }}>
                  {starString(advice.stars).slice(0, 5).split("").map((ch, i) => (
                    <span key={i} className={i < Math.round(advice.stars) ? "" : "dim"}>{ch}</span>
                  ))}
                  <span className="mono" style={{ marginLeft: "0.6rem", fontSize: "0.65rem", color: "var(--muted)" }}>
                    {advice.stars.toFixed(1)} · {advice.ratings} ratings{advice.accepted ? " · accepted" : ""}
                  </span>
              </span>
            </Link>
          ))}
          {given.length === 0 && <p className="note" style={{ marginTop: "1rem" }}>no advice yet. everyone starts somewhere.</p>}
        </div>
      </main>
    </>
  );
}
