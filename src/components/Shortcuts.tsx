"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const rows: [string, string][] = [
  ["g then f", "feed"],
  ["g then b", "leaderboard"],
  ["g then a", "alerts"],
  ["n", "new doubt"],
  ["/", "search"],
  ["?", "this card"],
];

export default function Shortcuts() {
  const router = useRouter();
  const [help, setHelp] = useState(false);
  useEffect(() => {
    let armed = false;
    let timer: ReturnType<typeof setTimeout>;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (armed) {
        armed = false; clearTimeout(timer);
        if (e.key === "f") router.push("/feed");
        if (e.key === "b") router.push("/leaderboard");
        if (e.key === "a") router.push("/notifications");
        return;
      }
      if (e.key === "g") { armed = true; timer = setTimeout(() => (armed = false), 900); }
      if (e.key === "n") router.push("/doubt/new");
      if (e.key === "/") { e.preventDefault(); router.push("/search"); }
      if (e.key === "?") setHelp((h) => !h);
      if (e.key === "Escape") setHelp(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (!help) return null;
  return (
    <div
      onClick={() => setHelp(false)}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(14,14,17,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div className="card chamfer-bl" style={{ padding: "1.5rem 1.75rem", minWidth: 280 }} onClick={(e) => e.stopPropagation()}>
        <p className="label" style={{ margin: "0 0 0.75rem" }}>keys</p>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "2rem", padding: "0.35rem 0", borderTop: "1px solid var(--line)" }}>
            <span className="kbd">{k}</span>
            <span className="mono" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{v}</span>
          </div>
        ))}
        <p className="note" style={{ marginTop: "0.9rem" }}>esc closes. like everything else in life.</p>
      </div>
    </div>
  );
}
