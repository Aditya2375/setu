import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Setu",
    short_name: "Setu",
    description: "The bridge between juniors and seniors. Ask anything, get rated advice.",
    start_url: "/feed",
    display: "standalone",
    background_color: "#0E0E11",
    theme_color: "#0E0E11",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}