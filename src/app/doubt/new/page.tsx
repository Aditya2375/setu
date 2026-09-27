"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { demoDoubts } from "@/lib/demo";
import { postDoubt } from "@/lib/live";

export default function NewDoubt() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [anon, setAnon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const similar = title.trim().length > 6
    ? demoDoubts.filter((d) =>
        d.title.toLowerCase().split(/\s+/).some((w) => w.length > 4 && title.toLowerCase().includes(w))
      ).slice(0, 3)
    : [];

  async function submit() {
    const t = title.trim();
    const b = body.trim();
    if (t.length < 8) return setError("give the doubt a real one-liner (8+ characters)");
    if (b.length < 20) return setError("add some context - 20+ characters gets better advice");
    setBusy(true);
    setError(null);
    const tagList = tags.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).slice(0, 5);
    const r = await postDoubt(t, b, tagList, anon);
    setBusy(false);
    if (r.error === "auth") return router.push("/login");
    if (r.error) return setError(r.error);
    router.push(`/doubt/${r.id}`);
  }

  return (
    <>
      <Navbar active="feed" />
      <main className="wrap" style={{ maxWidth: 680 }}>
        <p className="label" style={{ marginTop: "1.5rem" }}>post a doubt</p>
        <div className="card chamfer" style={{ padding: "1.5rem", marginTop: "1rem" }}>
          <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            the doubt, in one line
          </label>
          <input className="input" style={{ marginTop: "0.5rem" }} value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="How do I ... ?" />
          {similar.length > 0 && (
            <div style={{ marginTop: "0.75rem", border: "1px solid var(--accent)", padding: "0.85rem 1rem", background: "var(--accent-dim)" }}>
              <p className="mono" style={{ margin: 0, fontSize: "0.62rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                similar doubts exist - check these first?
              </p>
              {similar.map((d) => (
                <p key={d.id} style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
                  <Link href={`/doubt/${d.id}`} style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{d.title}</Link>
                  <span className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)" }}> · {d.advice.length} advice{d.solved ? " · solved" : ""}</span>
                </p>
              ))}
            </div>
          )}
          <label className="mono" style={{ display: "block", marginTop: "1.25rem", fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            details - context gets better advice
          </label>
          <textarea className="textarea" style={{ marginTop: "0.5rem" }} value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={"What you've tried, what your situation is, what 'good' looks like for you.\nMarkdown works: **bold**, `code`, lists."} />
          <label className="mono" style={{ display: "block", marginTop: "1.25rem", fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            tags (comma separated)
          </label>
          <input className="input" style={{ marginTop: "0.5rem" }} placeholder="academics, coding"
            value={tags} onChange={(e) => setTags(e.target.value)} />
          <label style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginTop: "1.25rem", cursor: "pointer" }}>
            <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "#E8A33D" }} />
            <span style={{ fontSize: "0.85rem" }}>
              Post anonymously
              <span className="mono" style={{ display: "block", fontSize: "0.62rem", color: "var(--muted)" }}>
                nobody sees it's you. some things are easier asked quietly.
              </span>
            </span>
          </label>
          {error && <p className="mono" style={{ color: "var(--bad, #d66)", fontSize: "0.7rem", marginTop: "0.75rem" }}>{error}</p>}
          <div style={{ display: "flex", marginTop: "1.5rem", gap: "1rem" }}>
            <button className="btn btn--accent chamfer" disabled={busy} onClick={submit}>
              {busy ? "…" : "Post the doubt"}
            </button>
            <Link href="/feed" className="btn btn--ghost chamfer">Cancel</Link>
          </div>
        </div>
      </main>
    </>
  );
}
