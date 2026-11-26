import Link from "next/link";
import { HERO } from "@/lib/landing-data";
import { ShineButton } from "@/components/ui/shine-button";
import { SpotlightSection } from "@/components/ui/spotlight-section";
import { DashboardPreview } from "./dashboard-preview";

// Hero text uses CSS entrance animations so it is visible as soon as the HTML paints (no wait for JavaScript).
export function Hero() {
  return (
    <SpotlightSection id="top" className="overflow-hidden">
      <div aria-hidden className="lp-drift absolute -top-40 -left-[120px] size-[520px] rounded-full bg-[rgba(79,70,229,.35)] blur-[120px]" />
      <div aria-hidden className="lp-drift-2 absolute top-[320px] left-[40%] size-[300px] rounded-full bg-[rgba(56,189,248,.14)] blur-[100px]" />
      <div aria-hidden className="lp-drift-2 absolute top-[120px] -right-[100px] size-[420px] rounded-full bg-[rgba(192,132,252,.22)] blur-[120px]" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-6 px-6 pt-24 pb-10 text-center">
        <p className="lp-fade inline-flex items-center gap-2 rounded-full border border-[rgba(129,140,248,.4)] bg-[rgba(79,70,229,.12)] px-3.5 py-1.5 text-[13px] text-[#c7d2fe]">
          <span aria-hidden className="lp-dot size-2 rounded-full bg-[#818cf8]" />
          {HERO.badge}
        </p>
        <h1 className="lp-fade-lcp lp-d1 lp-display m-0 max-w-[900px] text-[44px] leading-[1.02] font-bold tracking-[-0.03em] text-white min-[761px]:text-[76px]">
          {HERO.titleStart}
          <span className="lp-grad">{HERO.titleAccent}</span>
        </h1>
        <p className="lp-fade lp-d2 m-0 max-w-[620px] text-[19px] leading-[1.6] text-[#a1a1aa]">{HERO.subtitle}</p>
        <div className="lp-fade lp-d3 flex flex-wrap justify-center gap-3">
          <ShineButton href="/register">Start free</ShineButton>
          <Link
            href="#demo"
            className="lp-btn inline-flex min-h-12 items-center rounded-xl border border-white/15 bg-white/[.04] px-[26px] py-3.5 font-medium text-[#e4e4e7] hover:-translate-y-0.5 hover:text-white"
          >
            Try the live demo
          </Link>
        </div>
        <DashboardPreview />
      </div>
    </SpotlightSection>
  );
}
