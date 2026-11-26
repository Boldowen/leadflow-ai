import Link from "next/link";
import { NAV_LINKS } from "@/lib/landing-data";
import { Brand } from "./brand";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[rgba(10,10,15,.72)] backdrop-blur-[14px]">
      <nav aria-label="Main" className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <Brand />
        <div className="hidden gap-7 text-sm min-[761px]:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[#c7d2fe] hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="px-3.5 py-2.5 text-sm text-[#c7d2fe] hover:text-white">Log in</Link>
          <Link href="/register" className="lp-btn rounded-[10px] bg-[#4f46e5] px-[18px] py-2.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:text-white">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
