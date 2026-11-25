import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api/", "/f/", "/reset-password", "/forgot-password"] },
    sitemap: `${appUrl()}/sitemap.xml`,
    host: appUrl(),
  };
}
