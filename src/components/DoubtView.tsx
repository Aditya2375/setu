"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DemoDoubt, DemoAdvice } from "@/lib/demo";
import { postAdvice, rateAdvice, setFollow, reportContent } from "@/lib/live";

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s);

function Stars({ value, onRate, size = "0.95rem" }: { value: number; onRate?: (n: number) => void; size?: string }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= Math.round(value) ? "" : "dim"}
          style={onRate ? { cursor: "pointer" } : undefined}
          onClick={onRate ? () => onRate(n) : undefined}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function AdviceCard({ a, rank, live }: { a: DemoAdvice; rank: number; live: boolean }) {
  const router = useRouter();
  const [myRating, setMyRating] = useState(0);
  const [followFlash, setFollowFlash] = useState(false);
  const [reported, setReported] = useState(false);
  const shown = myRating ? (a.stars * a.ratings + myRating) / (a.ratings + 1) : a.stars;

  async function rate(n: number) {
    setMyRating(n);
    setFollowFlash(true);
    setTimeout(() => setFollowFlash(false), 900);
    if (live) {
      const err = await rateAdvice(a.id, n);
      if (err === "auth") router.push("/login");
    }
  }
  async function report() {
    setReported(true);
    if (live) {
      const err = await reportContent(null, a.id, "flagged from doubt page");
      if (err === "auth") router.push("/login");
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.07, type: "spring", stiffness: 120, damping: 18 }}
      className={`card chamfer-bl ${a.accepted ? "" : ""}`}
      style={{
        padding: "1.25rem 1.5rem", marginBottom: "1px",
        borderColor: a.accepted ? "var(--good)" : undefined,
        background: a.accepted ? "rgba(95,191,143,0.05)" : undefined,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <span className="avatar">{a.author.name[0]}</span>
        <div>
          <Link href={`/profile/${a.author.username}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "inherit" }}>{a.author.name}</Link>
          <span className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", marginLeft: "0.5rem" }}>
            {a.author.role}{a.author.flair ? " · trusted" : ""}
          </span>
        </div>
        {a.accepted && (
          <span className="tag badge-solved mono" style={{ marginLeft: "auto", fontSize: "0.6rem" }}>✓ accepted answer</span>
        )}
      </div>
      <p style={{ color: "var(--text)", fontSize: "0.95rem", margin: "0.9rem 0" }}>{a.body}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <motion.span key={shown.toFixed(1)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="mono"
          style={{ color: "var(--accent)", fontSize: "0.8rem" }}>
          {shown.toFixed(1)}
        </motion.span>
        <Stars value={shown} />
        <span className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
          {a.ratings + (myRating ? 1 : 0)} ratings
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {myRating === 0 ? (
            <span className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
              rate: <Stars value={0} onRate={rate} />
            </span>
          ) : (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mono"
              style={{ fontSize: "0.65rem", color: "var(--good)" }}>
              rated {myRating}★
            </motion.span>
          )}
          <button className="tag mono" style={{ background: "none", fontSize: "0.6rem" }} onClick={report}>
            {reported ? "reported" : "report"}
          </button>
        </span>
      </div>
      <AnimatePresence>
        {followFlash && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
            className="mono" style={{ fontSize: "0.65rem", color: "var(--good)", margin: "0.6rem 0 0" }}>
            your rating is in - the score moved live
          </motion.p>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function DoubtView({ doubt }: { doubt: DemoDoubt }) {
  const router = useRouter();
  const live = isUuid(doubt.id);
  const [following, setFollowing] = useState(false);
  const [extra, setExtra] = useState<DemoAdvice[]>([]);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const all = [...doubt.advice, ...extra];
  const sorted = [...all].sort((a, b) => {
    if (a.accepted) return -1;
    if (b.accepted) return 1;
    return b.stars * Math.log10(b.ratings + 2) - a.stars * Math.log10(a.ratings + 2);
  });

  async function toggleFollow() {
    const next = !following;
    setFollowing(next);
    if (live) {
      const err = await setFollow(doubt.id, next);
      if (err === "auth") { setFollowing(!next); router.push("/login"); }
    }
  }

  async function submitAdvice() {
    const body = draft.trim();
    if (body.length < 10) { setPostError("say a little more - 10+ characters"); return; }
    if (!live) {
      setExtra([...extra, { id: `local-${extra.length}`, author: { username: "you", name: "You", role: "junior" }, body, stars: 0, ratings: 0 }]);
      setDraft("");
      return;
    }
    setPosting(true);
    setPostError(null);
    const r = await postAdvice(doubt.id, body);
    setPosting(false);
    if (r.error === "auth") return router.push("/login");
    if (r.error) return setPostError(r.error);
    router.refresh();
    setExtra([...extra, { id: r.id!, author: { username: "you", name: "You", role: "junior" }, body, stars: 0, ratings: 0 }]);
    setDraft("");
  }

  return (
    <>
      <div style={{ margin: "1.5rem 0 2rem" }}>
        <div className="doubt-meta" style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <span className={`tag ${doubt.solved ? "badge-solved" : "badge-open"}`}>{doubt.solved ? "Solved" : "Open"}</span>
          {doubt.tags.map((t) => <span key={t} className="tag">{t}</span>)}
          <span className="mono" style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--muted)" }}>{doubt.ago}</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 4vw, 2rem)", lineHeight: 1.15, margin: "0.9rem 0", textTransform: "none" }}>
          {doubt.title}
        </h1>
        <p style={{ color: "var(--muted)" }}>{doubt.body}</p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
            by {doubt.anonymous ? "anonymous" : `${doubt.author?.name} (${doubt.author?.role})`}
          </span>
          <button
            className={`btn ${following ? "btn--accent" : "btn--ghost"} chamfer`}
            style={{ padding: "0.5em 1.2em", fontSize: "0.65rem", marginLeft: "auto" }}
            onClick={toggleFollow}
          >
            {following ? `following · ${doubt.follows + 1}` : `follow · ${doubt.follows}`}
          </button>
        </div>
      </div>

      <p className="label">{all.length} advice · rated by the community</p>
      <div style={{ marginTop: "1rem", borderTop: "1px solid var(--line)" }}>
        {sorted.map((a, i) => <AdviceCard key={a.id} a={a} rank={i} live={live} />)}
      </div>

      <div className="card chamfer" style={{ marginTop: "2rem", padding: "1.5rem" }}>
        <p className="label" style={{ fontSize: "0.65rem" }}>your advice</p>
        <textarea className="textarea" style={{ marginTop: "0.75rem" }} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What do you know that helps here? Be specific - the community rates specifics." />
        {postError && <p className="mono" style={{ color: "var(--bad, #d66)", fontSize: "0.7rem", marginTop: "0.5rem" }}>{postError}</p>}
        <div style={{ display: "flex", marginTop: "0.9rem", alignItems: "center", gap: "1rem" }}>
          <span className="mono" style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
            advice below 2★ average (5+ ratings) takes a 7-day cooldown
          </span>
          <button className="btn btn--accent chamfer" style={{ marginLeft: "auto", padding: "0.6em 1.4em", fontSize: "0.7rem" }}
            disabled={posting} onClick={submitAdvice}>
            {posting ? "…" : "Post advice"}
          </button>
        </div>
      </div>
    </>
  );
}
