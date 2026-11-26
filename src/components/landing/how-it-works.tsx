import { STEPS } from "@/lib/landing-data";
import { Reveal } from "@/components/ui/reveal";
import { Eyebrow, SectionTitle } from "./section-heading";

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 pt-[90px] pb-10">
      <Eyebrow>How it works</Eyebrow>
      <SectionTitle id="how-title" className="mb-12">From form submit to follow-up in seconds.</SectionTitle>
      <div className="relative">
      <div aria-hidden className="absolute top-[27px] right-7 left-7 hidden h-0.5 bg-[linear-gradient(90deg,#4f46e5,#c084fc,transparent)] min-[761px]:block" />
      <ol className="relative grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative">
            <Reveal delay={i * 0.1} className="flex flex-col gap-3.5">
              <span
                aria-hidden
                className="lp-ring-pulse lp-display flex size-14 items-center justify-center rounded-full border-2 border-[#6366f1] bg-[#14141c] text-xl font-bold text-white shadow-[0_0_30px_rgba(99,102,241,.55)]"
                style={{ animationDelay: `${i * 0.55}s` }}
              >
                {i + 1}
              </span>
              <h3 className="m-0 text-[19px] font-semibold text-white">{s.title}</h3>
              <p className="m-0 text-[15px] leading-[1.6] text-[#a1a1aa]">{s.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
      </div>
    </section>
  );
}
