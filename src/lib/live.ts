"use client";
// Live data layer: reads/writes Supabase when configured, callers fall back to demo.
import { getSupabase } from "./supabase";
import type { DemoDoubt, DemoAdvice, Persona } from "./demo";

export interface SessionUser { id: string; email: string; username: string; displayName: string; role: string; }

export function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function personaFrom(p: any): Persona {
  return { username: p?.username ?? "unknown", name: p?.display_name ?? "Unknown", role: p?.role === "senior" ? "senior" : "junior" };
}

function mapDoubt(row: any, adviceRows: any[], scores: Map<string, any>): DemoDoubt {
  const advice: DemoAdvice[] = (adviceRows || []).map((a: any) => {
    const sc = scores.get(a.id) || {};
    return {
      id: a.id,
      author: personaFrom(a.profiles ?? a.author),
      body: a.body,
      stars: Number(sc.avg_stars ?? 0),
      ratings: Number(sc.rating_count ?? 0),
      accepted: row.accepted_advice_id === a.id,
    };
  });
  const follows = Array.isArray(row.follows) && row.follows[0] ? Number(row.follows[0].count) : 0;
  return {
    id: row.id,
    author: row.is_anonymous ? null : personaFrom(row.profiles ?? row.author),
    anonymous: !!row.is_anonymous,
    title: row.title,
    body: row.body,
    tags: row.tags ?? [],
    solved: !!row.accepted_advice_id,
    advice,
    follows,
    ago: timeAgo(row.created_at),
  };
}

export async function fetchLiveDoubts(): Promise<DemoDoubt[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: doubts, error } = await sb
    .from("doubts")
    .select("id,title,body,tags,is_anonymous,created_at,accepted_advice_id,profiles:author_id(username,display_name,role),follows(count)")
    .order("created_at", { ascending: false })
    .limit(60);
  if (error || !doubts) return null;
  const ids = doubts.map((d: any) => d.id);
  const { data: advice } = await sb
    .from("advice")
    .select("id,doubt_id,body,profiles:author_id(username,display_name,role)")
    .in("doubt_id", ids.length ? ids : ["-"]);
  const { data: scores } = await sb.from("advice_scores").select("advice_id,avg_stars,rating_count");
  const scoreMap = new Map((scores ?? []).map((s: any) => [s.advice_id, s]));
  const byDoubt = new Map<string, any[]>();
  (advice ?? []).forEach((a: any) => {
    byDoubt.set(a.doubt_id, [...(byDoubt.get(a.doubt_id) ?? []), a]);
  });
  return doubts.map((d: any) => mapDoubt(d, byDoubt.get(d.id) ?? [], scoreMap));
}

export async function fetchLiveDoubt(id: string): Promise<DemoDoubt | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: row, error } = await sb
    .from("doubts")
    .select("id,title,body,tags,is_anonymous,created_at,accepted_advice_id,profiles:author_id(username,display_name,role),follows(count)")
    .eq("id", id)
    .maybeSingle();
  if (error || !row) return null;
  const { data: advice } = await sb
    .from("advice")
    .select("id,body,profiles:author_id(username,display_name,role)")
    .eq("doubt_id", id);
  const aIds = (advice ?? []).map((a: any) => a.id);
  const { data: scores } = aIds.length
    ? await sb.from("advice_scores").select("advice_id,avg_stars,rating_count").in("advice_id", aIds)
    : { data: [] as any[] };
  const scoreMap = new Map((scores ?? []).map((s: any) => [s.advice_id, s]));
  return mapDoubt(row, advice ?? [], scoreMap);
}

export interface BoardEntry { p: Persona; avg: number; ratings: number; advice: number; streak: string; }

export async function fetchLiveBoard(): Promise<BoardEntry[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: scores, error } = await sb
    .from("profile_scores")
    .select("user_id,avg_stars,rating_count,advice_count")
    .order("avg_stars", { ascending: false })
    .order("rating_count", { ascending: false })
    .limit(12);
  if (error || !scores) return null;
  const ids = scores.map((s: any) => s.user_id);
  const { data: profs } = await sb.from("profiles").select("id,username,display_name,role").in("id", ids.length ? ids : ["-"]);
  const pmap = new Map((profs ?? []).map((p: any) => [p.id, p]));
  return scores
    .filter((s: any) => pmap.has(s.user_id))
    .map((s: any) => ({
      p: personaFrom(pmap.get(s.user_id)),
      avg: Number(s.avg_stars),
      ratings: Number(s.rating_count),
      advice: Number(s.advice_count),
      streak: "-",
    }));
}

export interface LiveProfile {
  p: Persona; bio: string; adviceCount: number; ratings: number; avg: number;
  given: { doubtId: string; doubtTitle: string; advice: DemoAdvice }[];
}

export async function fetchLiveProfile(username: string): Promise<LiveProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: prof, error } = await sb
    .from("profiles").select("id,username,display_name,role,bio").eq("username", username).maybeSingle();
  if (error || !prof) return null;
  const { data: advice } = await sb
    .from("advice")
    .select("id,body,doubt_id,doubts:doubt_id(id,title,accepted_advice_id)")
    .eq("author_id", prof.id)
    .order("created_at", { ascending: false })
    .limit(30);
  const aIds = (advice ?? []).map((a: any) => a.id);
  const { data: scores } = aIds.length
    ? await sb.from("advice_scores").select("advice_id,avg_stars,rating_count").in("advice_id", aIds)
    : { data: [] as any[] };
  const scoreMap = new Map((scores ?? []).map((s: any) => [s.advice_id, s]));
  const me = personaFrom(prof);
  const given = (advice ?? []).map((a: any) => {
    const sc = scoreMap.get(a.id) || {};
    return {
      doubtId: a.doubts?.id ?? "",
      doubtTitle: a.doubts?.title ?? "",
      advice: {
        id: a.id, author: me, body: a.body,
        stars: Number(sc.avg_stars ?? 0), ratings: Number(sc.rating_count ?? 0),
        accepted: a.doubts?.accepted_advice_id === a.id,
      } as DemoAdvice,
    };
  });
  const ratings = given.reduce((n, g) => n + g.advice.ratings, 0);
  const rated = given.filter((g) => g.advice.ratings > 0);
  const avg = rated.length ? rated.reduce((n, g) => n + g.advice.stars, 0) / rated.length : 0;
  return { p: me, bio: prof.bio ?? "", adviceCount: given.length, ratings, avg, given };
}

export async function searchLive(q: string): Promise<DemoDoubt[] | null> {
  const sb = getSupabase();
  if (!sb || !q.trim()) return null;
  const esc = q.replace(/[%_,()]/g, " ").trim();
  if (!esc) return null;
  const { data: doubts, error } = await sb
    .from("doubts")
    .select("id,title,body,tags,is_anonymous,created_at,accepted_advice_id,profiles:author_id(username,display_name,role),follows(count)")
    .or(`title.ilike.%${esc}%,body.ilike.%${esc}%`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error || !doubts) return null;
  return doubts.map((d: any) => mapDoubt(d, [], new Map()));
}

// ---- auth ----

export async function getSessionUser(): Promise<SessionUser | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  const m = (u.user_metadata ?? {}) as any;
  return {
    id: u.id,
    email: u.email ?? "",
    username: m.username ?? "user",
    displayName: m.display_name ?? m.username ?? "User",
    role: m.role === "senior" ? "senior" : "junior",
  };
}

export function onAuthChange(cb: (u: SessionUser | null) => void) {
  const sb = getSupabase();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange(async (_evt, session) => {
    const u = session?.user;
    if (!u) return cb(null);
    const m = (u.user_metadata ?? {}) as any;
    cb({ id: u.id, email: u.email ?? "", username: m.username ?? "user", displayName: m.display_name ?? m.username ?? "User", role: m.role === "senior" ? "senior" : "junior" });
  });
  return () => data.subscription.unsubscribe();
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "backend not configured";
  const { error } = await sb.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}

export async function signUp(email: string, password: string, username: string, displayName: string, role: string): Promise<{ error?: string; needsConfirm?: boolean }> {
  const sb = getSupabase();
  if (!sb) return { error: "backend not configured" };
  const { data, error } = await sb.auth.signUp({
    email, password,
    options: { data: { username, display_name: displayName, role } },
  });
  if (error) return { error: error.message };
  return { needsConfirm: !data.session };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

// ---- writes (RLS enforces auth.uid() ownership server-side) ----

export async function postDoubt(title: string, body: string, tags: string[], anon: boolean): Promise<{ id?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "backend not configured" };
  const u = await getSessionUser();
  if (!u) return { error: "auth" };
  const { data, error } = await sb
    .from("doubts")
    .insert({ title, body, tags, is_anonymous: anon, author_id: u.id })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function postAdvice(doubtId: string, body: string): Promise<{ id?: string; error?: string }> {
  const sb = getSupabase();
  if (!sb) return { error: "backend not configured" };
  const u = await getSessionUser();
  if (!u) return { error: "auth" };
  const { data, error } = await sb
    .from("advice")
    .insert({ doubt_id: doubtId, author_id: u.id, body })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function rateAdvice(adviceId: string, stars: number): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "backend not configured";
  const u = await getSessionUser();
  if (!u) return "auth";
  const { error } = await sb.from("ratings").upsert(
    { advice_id: adviceId, rater_id: u.id, stars },
    { onConflict: "advice_id,rater_id" }
  );
  return error ? error.message : null;
}

export async function setFollow(doubtId: string, on: boolean): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "backend not configured";
  const u = await getSessionUser();
  if (!u) return "auth";
  if (on) {
    const { error } = await sb.from("follows").upsert({ doubt_id: doubtId, user_id: u.id });
    return error ? error.message : null;
  }
  const { error } = await sb.from("follows").delete().eq("doubt_id", doubtId).eq("user_id", u.id);
  return error ? error.message : null;
}

export async function reportContent(doubtId: string | null, adviceId: string | null, reason: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return "backend not configured";
  const u = await getSessionUser();
  if (!u) return "auth";
  const { error } = await sb.from("reports").insert({ reporter_id: u.id, doubt_id: doubtId, advice_id: adviceId, reason });
  return error ? error.message : null;
}

export interface LiveNotif { kind: string; text: string; ago: string; unread: boolean; doubtId: string | null; }

export async function fetchNotifications(): Promise<LiveNotif[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const u = await getSessionUser();
  if (!u) return null;
  const { data, error } = await sb
    .from("notifications")
    .select("kind,text,read,created_at,doubt_id")
    .eq("user_id", u.id)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error || !data) return null;
  return data.map((n: any) => ({ kind: n.kind, text: n.text, ago: timeAgo(n.created_at), unread: !n.read, doubtId: n.doubt_id }));
}

export async function markNotificationsRead(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const u = await getSessionUser();
  if (!u) return;
  await sb.from("notifications").update({ read: true }).eq("user_id", u.id).eq("read", false);
}
