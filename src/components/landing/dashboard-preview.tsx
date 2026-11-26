import { LEVELS, PIPELINE_STAGES, PREVIEW_ROWS } from "@/lib/landing-data";
import { TiltCard } from "@/components/ui/tilt-card";
import { Ticker } from "./ticker";

/** A mock of the lead dashboard with sample data, tilting toward the mouse. */
export function DashboardPreview() {
  return (
    <div className="relative mt-10 w-full max-w-[980px]">
      <div aria-hidden className="absolute inset-[10%_8%_-6%_8%] rounded-[40px] bg-[rgba(99,102,241,.45)] blur-[80px]" />
      <TiltCard
        className="relative"
        innerClassName="overflow-hidden rounded-[18px] border border-white/[.12] bg-[#111118] text-left shadow-[0_40px_120px_-40px_rgba(0,0,0,.9)]"
      >
        <figure aria-label="Preview of the Emberza lead dashboard with sample leads">
          <div className="flex items-center gap-2 border-b border-white/[.08] px-4 py-3">
            {[0, 1, 2].map((i) => (
              <span key={i} aria-hidden className="size-[11px] rounded-full bg-[#3f3f46]" />
            ))}
            <span className="ml-3 text-xs text-[#a1a1aa]">emberza.dev/dashboard · demo data</span>
          </div>
          <div className="flex flex-col gap-2.5 p-5">
            <div className="flex flex-wrap gap-2 text-xs">
              {PIPELINE_STAGES.map((s) => (
                <span key={s} className="rounded-full border border-white/[.08] bg-white/[.05] px-3 py-1.5 text-[#a1a1aa]">{s}</span>
              ))}
            </div>
            <ul className="flex flex-col gap-2.5">
              {PREVIEW_ROWS.map((r) => {
                const lv = LEVELS[r.level];
                return (
                  <li
                    key={r.name}
                    className="lp-row grid grid-cols-[1.3fr_2.4fr_.8fr] items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.03] px-3.5 py-3 text-sm max-[500px]:grid-cols-[1fr_auto]"
                    style={{ animationDelay: `${r.delay}s` }}
                  >
                    <span className="font-medium text-white">{r.name}</span>
                    <span className="truncate text-[#a1a1aa] max-[500px]:hidden">{r.note}</span>
                    <span
                      className={`justify-self-end rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${r.level === "hot" ? "lp-hot-glow" : ""}`}
                      style={{ color: lv.color, borderColor: lv.color }}
                    >
                      {lv.name} · {r.score}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </figure>
      </TiltCard>
      <Ticker />
      <div
        aria-hidden
        className="lp-float-2 absolute -right-9 bottom-[60px] hidden rounded-[14px] border border-[rgba(56,189,248,.45)] bg-[rgba(24,24,32,.9)] px-4 py-3 text-left text-[13px] backdrop-blur-[8px] min-[761px]:block"
      >
        <div className="font-semibold text-[#7dd3fc]">Telegram alert sent</div>
        <div className="text-[#a1a1aa]">Row added to Google Sheets</div>
      </div>
    </div>
  );
}
