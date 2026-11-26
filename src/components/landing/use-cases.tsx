import { USE_CASES } from "@/lib/landing-data";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, SectionTitle } from "./section-heading";

export function UseCases() {
  return (
    <section aria-labelledby="uses-title" className="mx-auto max-w-[1200px] px-6 pt-[90px] pb-10">
      <Eyebrow>Use cases</Eyebrow>
      <SectionTitle id="uses-title" className="mb-10">Built for teams that live in their inbox.</SectionTitle>
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))]">
        {USE_CASES.map((u, i) => (
          <Reveal key={u.title} delay={i * 0.08}>
            <article className="lp-card h-full rounded-[20px] border border-white/[.08] bg-white/[.03] p-7">
              <h3 className="m-0 mb-2.5 text-xl font-semibold text-white">{u.title}</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-[#a1a1aa]">{u.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
