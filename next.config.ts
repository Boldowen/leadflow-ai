import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// No nonces: the pages are mostly static, and nothing renders user HTML. 'unsafe-inline' is required by
// Next's inline bootstrap scripts without nonces; everything else is locked to this origin.
const csp = (frameAncestors: string) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
    ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

// Vercel preview deployments must never be indexed (production sets VERCEL_ENV=production).
const isPreview = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";

const securityHeaders = [
  ...(isPreview ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Nothing may frame the app…
      {
        source: "/((?!f/).*)",
        headers: [{ key: "Content-Security-Policy", value: csp("'none'") }, { key: "X-Frame-Options", value: "DENY" }],
      },
      // …except the hosted contact form, which customers embed in their own sites.
      { source: "/f/:formKey", headers: [{ key: "Content-Security-Policy", value: csp("*") }] },
    ];
  },
};

export default nextConfig;
