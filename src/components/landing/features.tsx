import { ArrowRightCircle, Flame, Inbox, LayoutDashboard, Sparkles, Zap, type LucideIcon } from "lucide-react";
import { FEATURES, type FeatureIcon } from "@/lib/landing-data";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, SectionTitle } from "./section-heading";

const ICONS: Record<FeatureIcon, LucideIcon> = { inbox: Inbox, sparkles: Sparkles, flame: Flame, arrow: ArrowRightCircle, dashboard: LayoutDashboard, zap: Zap };

export function Features() {
  return (
    <section id="features" aria-labelledby="features-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 pt-[110px] pb-10">
      <Eyebrow>Features</Eyebrow>
      <SectionTitle id="features-title" className="mb-10 max-w-[640px]">Everything a small sales team needs to stop guessing.</SectionTitle>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
        {FEATURES.map((f, i) => {
          const Icon = ICONS[f.icon];
          return (
            <Reveal key={f.title} delay={(i % 3) * 0.08}>
              <article className="lp-card flex h-full flex-col gap-3.5 rounded-[20px] border border-white/[.08] bg-white/[.03] p-7">
                <span className="lp-icon flex size-11 items-center justify-center rounded-xl border border-[rgba(129,140,248,.35)] bg-[rgba(79,70,229,.18)]">
                  <Icon aria-hidden size={22} strokeWidth={1.8} color="#c7d2fe" />
                </span>
                <h3 className="m-0 text-[19px] font-semibold text-white">{f.title}</h3>
                <p className="m-0 text-[15px] leading-[1.6] text-[#a1a1aa]">{f.body}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
