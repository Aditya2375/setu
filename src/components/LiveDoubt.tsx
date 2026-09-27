"use client";
import { useEffect, useState } from "react";
import DoubtView from "@/components/DoubtView";
import type { DemoDoubt } from "@/lib/demo";
import { fetchLiveDoubt } from "@/lib/live";

export default function LiveDoubt({ id, demo }: { id: string; demo: DemoDoubt | null }) {
  const [doubt, setDoubt] = useState<DemoDoubt | null>(demo);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    if (demo) return; // demo ids (d1..d6) render instantly; live uuids fetch below
    fetchLiveDoubt(id).then((d) => {
      if (d) setDoubt(d);
      else setMissing(true);
    });
  }, [id, demo]);
  if (!doubt && !missing) {
    return <p className="note" style={{ marginTop: "2rem" }}>loading the doubt…</p>;
  }
  if (missing || !doubt) {
    return <p className="note" style={{ marginTop: "2rem" }}>that doubt isn&apos;t on the bridge. it may have been removed.</p>;
  }
  return <DoubtView doubt={doubt} />;
}
