import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
