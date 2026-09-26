import Link from "next/link";
import Navbar from "@/components/Navbar";
import { demoDoubts, demoTrending } from "@/lib/demo";

export const metadata = { title: "Feed" };

export default function Feed() {
  const trending = demoDoubts.filter((d) => demoTrending.includes(d.id));
  return (
    <>
      <Navbar active="feed" />
      <main className="wrap">
        <p className="label">trending this week</p>
        <div className="hscroll" style={{ display: "flex", gap: "1px", background: "var(--line)", margin: "0.75rem 0 2rem", overflowX: "auto" }}>
          {trending.map((d, i) => (
            <Link key={d.id} href={`/doubt/${d.id}`} className={i === 0 ? "card tilt" : "card"} style={{ padding: "0.9rem 1.1rem", minWidth: 240, flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>{d.title}</p>
              <p className="mono" style={{ margin: "0.4rem 0 0", fontSize: "0.65rem", color: "var(--accent)" }}>
                {d.follows} following
              </p>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <p className="label" style={{ margin: 0 }}>all doubts</p>
          <span style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
            <span className="tag tag--accent">All</span>
            <span className="tag badge-open">Open</span>
            <span className="tag badge-solved">Solved</span>
          </span>
        </div>

        <p className="note" style={{ margin: "0.6rem 0 0" }}>
          {demoDoubts.filter((d) => !d.solved).length} open right now - the one everyone is watching has {[...demoDoubts].sort((a, b) => b.follows - a.follows)[0].follows} followers. of course it does.
        </p>

        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--line)" }}>
          {demoDoubts.map((d) => (
            <Link key={d.id} href={`/doubt/${d.id}`} className="card doubt-card">
              <div className="doubt-meta">
                <span className={`tag ${d.solved ? "badge-solved" : "badge-open"}`} style={{ fontSize: "0.6rem" }}>
                  {d.solved ? "Solved" : "Open"}
                </span>
                {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                <span className="mono" style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--muted)" }}>{d.ago}</span>
              </div>
              <h2 className="doubt-title">{d.title}</h2>
              <div className="doubt-meta mono" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                <span>{d.anonymous ? "anonymous" : d.author?.name} {d.author?.role === "senior" ? "(senior)" : d.author ? "(junior)" : ""}</span>
                <span>{d.advice.length} advice</span>
                <span>{d.follows} following</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}