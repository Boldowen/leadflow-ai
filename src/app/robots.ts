import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";
import { isIndexable } from "@/lib/seo";

// robots.txt only guides crawlers; private routes are protected by authentication, not by this file.
// Auth pages are not disallowed here so crawlers can see their `noindex` tag.
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api/", "/f/"] },
    sitemap: `${appUrl()}/sitemap.xml`,
    host: appUrl(),
  };
}
