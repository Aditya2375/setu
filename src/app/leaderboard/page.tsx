import Navbar from "@/components/Navbar";
import { personas } from "@/lib/demo";

export const metadata = { title: "Leaderboard" };

const board = [
  { p: personas.sneha, avg: 4.9, ratings: 132, advice: 31, streak: "12w" },
  { p: personas.dev, avg: 4.7, ratings: 118, advice: 42, streak: "9w" },
  { p: personas.arjun, avg: 4.6, ratings: 96, advice: 27, streak: "8w" },
  { p: personas.ananya, avg: 4.4, ratings: 61, advice: 19, streak: "5w" },
  { p: personas.isha, avg: 4.1, ratings: 12, advice: 6, streak: "2w" },
  { p: personas.rohan, avg: 3.6, ratings: 8, advice: 4, streak: "1w" },
];

export default function Leaderboard() {
  return (
    <>
      <Navbar active="board" />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <p className="label" style={{ marginTop: "1.5rem" }}>top advisors · all time</p>
        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--line)" }}>
          {board.map((b, i) => (
            <div key={b.p.username} className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", marginBottom: 1 }}>
              <span className="mono" style={{ fontSize: "1.1rem", color: i < 3 ? "var(--accent)" : "var(--muted)", width: "2ch" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="avatar">{b.p.name[0]}</span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>
                  {b.p.name}
                  {b.p.flair && <span className="tag tag--accent mono" style={{ marginLeft: "0.6rem", fontSize: "0.55rem" }}>trusted</span>}
                </p>
                <p className="mono" style={{ margin: "0.15rem 0 0", fontSize: "0.65rem", color: "var(--muted)" }}>
                  {b.advice} advice · {b.ratings} ratings · {b.streak} streak
                </p>
              </div>
              <span className="mono" style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "1rem" }}>
                {b.avg.toFixed(1)}★
              </span>
            </div>
          ))}
        </div>
        <p className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: "1.5rem" }}>
          scores are the community average of every rating ever received. drop below 2.0★ with 5+ ratings and advice privileges pause for 7 days.
        </p>
      </main>
    </>
  );
}