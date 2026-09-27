import Navbar from "@/components/Navbar";
import LiveProfile from "@/components/LiveProfile";
import { personas } from "@/lib/demo";

export function generateStaticParams() {
  return Object.values(personas).map((p) => ({ username: p.username }));
}

export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <>
      <Navbar />
      <main className="wrap" style={{ maxWidth: 780 }}>
        <LiveProfile username={username} />
      </main>
    </>
  );
}
