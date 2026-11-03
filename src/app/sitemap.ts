import type { MetadataRoute } from "next";

const BASE = "https://setu-aditya-kulkarni.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/feed", "/leaderboard", "/search", "/doubt/new", "/login"];
  return routes.map((route) => ({
    url: BASE + route,
    lastModified: new Date("2026-11-03"),
  }));
}
