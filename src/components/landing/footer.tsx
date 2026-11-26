import Link from "next/link";
import { FOOTER } from "@/lib/landing-data";
import { Brand } from "./brand";

export function Footer() {
  return (
    <footer className="border-t border-white/[.08]">
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-12 text-sm [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <div className="flex flex-col gap-2.5">
          <Brand size={24} />
          <span className="text-[#a1a1aa]">{FOOTER.tagline}</span>
          <a href={`mailto:${FOOTER.email}`} className="text-[#c7d2fe] hover:text-white">{FOOTER.email}</a>
        </div>
        {FOOTER.groups.map((g) => (
          <nav key={g.title} aria-label={g.title} className="flex flex-col gap-2.5">
            <h2 className="m-0 text-sm font-semibold text-white">{g.title}</h2>
            {g.links.map((l) => (
              <Link key={l.href} href={l.href} className="text-[#c7d2fe] hover:text-white">{l.label}</Link>
            ))}
            {g.title === "Account" && (
              <a href={FOOTER.github} rel="noopener" className="text-[#c7d2fe] hover:text-white">GitHub</a>
            )}
          </nav>
        ))}
      </div>
      <p className="mx-auto max-w-[1200px] px-6 pb-8 text-[13px] text-[#a1a1aa]">© {new Date().getFullYear()} Emberza · Built with Next.js, PostgreSQL and Claude</p>
    </footer>
  );
}
