import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shortcuts from "@/components/Shortcuts";

export const metadata: Metadata = {
  title: { default: "Setu - the bridge between juniors and seniors", template: "%s | Setu" },
  description:
    "Post a doubt about anything - academics, music, sport, life on campus. Seniors and peers answer, the community scores the advice, the best rises.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: "Setu",
    title: "Setu - the bridge between juniors and seniors",
    description: "Ask anything. Get advice that the community has rated worth listening to.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0E11",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <div className="grid-bg" aria-hidden="true" />
        {children}
          <Shortcuts />
      </body>
    </html>
  );
}