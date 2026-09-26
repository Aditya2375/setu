"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { demoDoubts } from "@/lib/demo";

export default function Search() {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const hits = needle
    ? demoDoubts.filter((d) =>
        [d.title, d.body, d.tags.join(" ")].join(" ").toLowerCase().includes(needle)
      )
    : [];
  return (
    <>
      <Navbar active="search" />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <p className="label" style={{ marginTop: "1.5rem" }}>search the bridge</p>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="cgpa, hostel, guitar, trials…"
          className="input"
          style={{ marginTop: "1rem", fontSize: "1.05rem" }}
        />
        <p className="note" style={{ marginTop: "0.6rem" }}>
          {needle ? `${hits.length} match${hits.length === 1 ? "" : "es"} for "${q.trim()}"` : "search before you post - odds are someone already asked."}
        </p>
        <div style={{ marginTop: "1.25rem", borderTop: needle ? "1px solid var(--line)" : "none" }}>
          {hits.map((d) => (
            <Link key={d.id} href={`/doubt/${d.id}`} className="card doubt-card">
              <div className="doubt-meta">
                <span className={`tag ${d.solved ? "badge-solved" : "badge-open"}`} style={{ fontSize: "0.6rem" }}>
                  {d.solved ? "Solved" : "Open"}
                </span>
                {d.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                <span className="mono" style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--muted)" }}>{d.ago}</span>
              </div>
              <h2 className="doubt-title">{d.title}</h2>
            </Link>
          ))}
          {needle && hits.length === 0 && (
            <p className="note" style={{ marginTop: "1rem" }}>
              nothing yet. that's your cue - <Link href="/doubt/new" style={{ color: "var(--accent)" }}>ask it first</Link>.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
