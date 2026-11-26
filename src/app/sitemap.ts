import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Only public, canonical, indexable pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/docs"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacy"), lastModified: "2026-11-26", changeFrequency: "yearly", priority: 0.3 },
  ];
}
