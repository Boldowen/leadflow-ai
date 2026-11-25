import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { appUrl } from "@/lib/app-url";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const description =
  "Emberza reads every inbound lead, writes a one-line summary, scores it Hot, Warm or Cold with AI and suggests the next step — so small teams know who to call first.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "Emberza — AI lead qualification for small teams", template: "%s · Emberza" },
  description,
  applicationName: "Emberza",
  openGraph: {
    type: "website",
    siteName: "Emberza",
    locale: "en_US",
    url: "/",
    title: "Emberza — know which leads to call first",
    description,
  },
  twitter: { card: "summary_large_image", title: "Emberza — know which leads to call first", description },
  formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = { themeColor: "#4f46e5" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
