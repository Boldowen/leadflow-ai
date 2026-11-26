import { appUrl } from "./app-url";

export const SITE = {
  name: "Emberza",
  title: "Emberza | AI Lead Qualification & Scoring",
  description:
    "Emberza helps small sales teams qualify inbound leads, automate AI lead scoring, and prioritize high-value prospects to close more deals.",
  contactEmail: "hello@emberza.dev",
  sourceCode: "https://github.com/Boldowen/leadflow-ai",
} as const;

/** Only real production deployments may be indexed; Vercel previews and local builds are not. */
export const isIndexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export const absoluteUrl = (path = "/") => `${appUrl()}${path === "/" ? "" : path}`;

export const organizationId = `${appUrl()}/#organization`;
export const websiteId = `${appUrl()}/#website`;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: SITE.name,
    url: absoluteUrl("/"),
    logo: { "@type": "ImageObject", url: absoluteUrl("/brand/icon-512.png"), width: 512, height: 512 },
    image: absoluteUrl("/brand/logo.png"),
    email: SITE.contactEmail,
  };
}

export function websiteJsonLd() {
  return { "@type": "WebSite", "@id": websiteId, name: SITE.name, url: absoluteUrl("/"), inLanguage: "en", publisher: { "@id": organizationId } };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
