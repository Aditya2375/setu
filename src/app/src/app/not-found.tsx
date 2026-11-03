import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap" style={{ maxWidth: 900 }}>
      <p className="label" style={{ marginTop: "4rem" }}>setu // lost</p>
      <h1 className="hero-title" style={{ margin: "1rem 0", maxWidth: "14ch" }}>
        This bridge goes nowhere.
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: "46ch", fontSize: "1.05rem" }}>
        The page you asked for moved or never existed. The doubts are all still standing.
      </p>
      <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn--accent chamfer">Back to the bridge</Link>
        <Link href="/feed" className="btn--ghost btn chamfer">Open the feed</Link>
      </div>
    </main>
  );
}
