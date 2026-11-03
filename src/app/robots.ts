import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://setu-aditya-kulkarni.vercel.app/sitemap.xml",
  };
}
