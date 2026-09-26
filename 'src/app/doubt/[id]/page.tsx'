import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import DoubtView from "@/components/DoubtView";
import { demoDoubts } from "@/lib/demo";

export function generateStaticParams() {
  return demoDoubts.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = demoDoubts.find((x) => x.id === id);
  if (!d) return {};
  return {
    title: d.title,
    openGraph: {
      title: d.title,
      description: d.body.slice(0, 140),
      type: "article",
      siteName: "Setu",
    },
  };
}

export default async function DoubtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doubt = demoDoubts.find((x) => x.id === id);
  if (!doubt) notFound();
  return (
    <>
      <Navbar active="feed" />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <DoubtView doubt={doubt} />
      </main>
    </>
  );
}