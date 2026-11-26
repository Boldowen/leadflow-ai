import Link from "next/link";
import { FINAL_CTA } from "@/lib/landing-data";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-[1200px] px-6 pt-[90px] pb-[110px]">
      <div className="relative overflow-hidden rounded-[28px] p-0.5">
        <div
          aria-hidden
          className="lp-spin-slow absolute -top-[150%] -left-1/2 h-[400%] w-[200%] bg-[conic-gradient(from_0deg,#4f46e5,#c084fc,#0a0a0f_40%,#0a0a0f_60%,#4f46e5)]"
        />
        <div className="relative flex flex-col items-center gap-5 rounded-[26px] bg-[#0e0e15] px-6 py-[72px] text-center">
          <h2 id="cta-title" className="lp-display m-0 text-[36px] leading-tight tracking-[-0.02em] text-white min-[761px]:text-5xl">
            {FINAL_CTA.titleStart}
            <span className="lp-grad">{FINAL_CTA.titleAccent}</span>
          </h2>
          <p className="m-0 text-[17px] text-[#a1a1aa]">{FINAL_CTA.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <MagneticButton
              href="/register"
              className="lp-btn inline-flex min-h-12 items-center rounded-xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] px-[26px] py-3.5 font-semibold text-white hover:text-white"
            >
              Sign up free
            </MagneticButton>
            <Link href="/docs" className="lp-btn inline-flex min-h-12 items-center rounded-xl border border-white/15 px-[26px] py-3.5 text-[#e4e4e7] hover:-translate-y-0.5 hover:text-white">
              Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
