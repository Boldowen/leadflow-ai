import { MARQUEE } from "@/lib/landing-data";

/** Endless strip of integrations and building blocks; pauses on hover. The list is doubled for a seamless loop. */
export function Marquee() {
  return (
    <div className="lp-marquee-wrap overflow-hidden border-y border-white/[.06] py-[22px] [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
      <div className="lp-marquee lp-display flex w-max gap-14 text-lg text-[#a1a1aa]">
        <ul aria-label="Works with" className="flex gap-14">
          {MARQUEE.map((m) => <li key={m} className="whitespace-nowrap">{m}</li>)}
        </ul>
        <ul aria-hidden className="flex gap-14">
          {MARQUEE.map((m) => <li key={m} className="whitespace-nowrap">{m}</li>)}
        </ul>
      </div>
    </div>
  );
}
