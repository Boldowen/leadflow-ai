import type { Metadata, Viewport } from "next";
import { appUrl } from "@/lib/app-url";
import { isIndexable, SITE } from "@/lib/seo";
import { inter, spaceGrotesk } from "./fonts";
import "./globals.css";
// Shared effects (buttons, shine, reveal fallbacks) used by the landing page and the navbar/footer on other pages.
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: SITE.title, template: "%s | Emberza" },
  description: SITE.description,
  applicationName: SITE.name,
  robots: isIndexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_US", url: "/", title: SITE.title, description: SITE.description },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  formatDetection: { email: false, telephone: false, address: false },
  // Optional ownership tokens; set them in the environment, never in code.
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0f", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
