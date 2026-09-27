"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/live";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"junior" | "senior">("junior");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    if (mode === "login") {
      const err = await signIn(email.trim(), password);
      setBusy(false);
      if (err) return setError(err);
      router.push("/feed");
    } else {
      const uname = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (!name.trim() || !uname) { setBusy(false); return setError("name and username are needed"); }
      if (password.length < 6) { setBusy(false); return setError("password needs 6+ characters"); }
      const err = await signUp(email.trim(), password, uname, name.trim(), role);
      setBusy(false);
      if (err) return setError(err);
      router.push("/feed");
    }
  }

  return (
    <main className="wrap" style={{ maxWidth: 440 }}>
      <p className="label" style={{ marginTop: "4rem" }}>setu // {mode === "login" ? "welcome back" : "join the bridge"}</p>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: "0.75rem 0 1.5rem", textTransform: "uppercase" }}>
        {mode === "login" ? "Log in" : "Sign up"}
      </h1>
      <div className="card chamfer" style={{ padding: "1.5rem" }}>
        {mode === "signup" && (
          <>
            <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>name</label>
            <input className="input" style={{ marginTop: "0.4rem", marginBottom: "1rem" }} placeholder="Your name"
              value={name} onChange={(e) => setName(e.target.value)} />
            <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>username</label>
            <input className="input" style={{ marginTop: "0.4rem", marginBottom: "1rem" }} placeholder="unique_handle"
              value={username} onChange={(e) => setUsername(e.target.value)} />
            <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>i am a</label>
            <div style={{ display: "flex", gap: "0.75rem", margin: "0.5rem 0 1rem" }}>
              {(["junior", "senior"] as const).map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`btn chamfer ${role === r ? "btn--accent" : "btn--ghost"}`}
                  style={{ flex: 1, padding: "0.7em", fontSize: "0.7rem" }}>
                  {r}
                </button>
              ))}
            </div>
          </>
        )}
        <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>email</label>
        <input className="input" type="email" style={{ marginTop: "0.4rem", marginBottom: "1rem" }} placeholder="you@college.edu"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>password</label>
        <input className="input" type="password" style={{ marginTop: "0.4rem" }} placeholder="••••••••"
          value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !busy) submit(); }} />
        {error && <p className="mono" style={{ color: "var(--bad, #d66)", fontSize: "0.7rem", marginTop: "0.75rem" }}>{error}</p>}
        <button className="btn btn--accent chamfer" style={{ width: "100%", marginTop: "1.5rem" }}
          disabled={busy} onClick={submit}>
          {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.8rem", color: "var(--muted)" }}>
          {mode === "login" ? "New here? " : "Have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", textDecoration: "underline", textUnderlineOffset: 3 }}>
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
      <p style={{ textAlign: "center", marginTop: "1rem" }}>
        <Link href="/feed" className="mono" style={{ fontSize: "0.65rem", color: "var(--muted)" }}>browse without an account →</Link>
      </p>
    </main>
  );
}
