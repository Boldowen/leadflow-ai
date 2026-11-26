import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/brand/logo.png";
import { SITE } from "@/lib/seo";

const groups = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Lead management features" },
      { href: "/#how-it-works", label: "How Emberza works" },
      { href: "/#ai-lead-scoring", label: "AI lead scoring" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/docs", label: "Documentation" },
      { href: "/docs#rest-api", label: "REST API" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/register", label: "Sign up free" },
      { href: "/login", label: "Log in" },
    ],
  },
];

// The footer background matches the logo artwork's own near-black background (#000007), so the logo blends in.
export function SiteFooter() {
  return (
    <footer className="bg-[#000007] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Link href="/" aria-label="Emberza home" className="inline-block">
            <Image src={logo} alt="Emberza" width={176} height={Math.round((176 * logo.height) / logo.width)} sizes="176px" />
          </Link>
          <p className="max-w-xs text-sm leading-6 text-slate-400">AI lead qualification and scoring for small sales teams.</p>
          <p className="text-sm">
            <a href={`mailto:${SITE.contactEmail}`} className="hover:text-white">{SITE.contactEmail}</a>
          </p>
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="text-sm font-semibold text-white">{group.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Emberza. Built with Next.js, PostgreSQL and Claude.</p>
          <a href={SITE.sourceCode} className="hover:text-white" rel="noopener">Source code on GitHub</a>
        </div>
      </div>
    </footer>
  );
}
