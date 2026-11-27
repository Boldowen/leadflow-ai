const tempStyles: Record<string, string> = {
  HOT: "bg-red-500/10 text-red-300 ring-red-400/30",
  WARM: "bg-amber-500/10 text-amber-300 ring-amber-400/30",
  COLD: "bg-sky-500/10 text-sky-300 ring-sky-400/30",
};
const tempIcon: Record<string, string> = { HOT: "🔥", WARM: "☀️", COLD: "❄️" };

const statusStyles: Record<string, string> = {
  NEW: "bg-white/[.06] text-zinc-300",
  CONTACTED: "bg-indigo-500/15 text-indigo-300",
  QUALIFIED: "bg-violet-500/15 text-violet-300",
  WON: "bg-emerald-500/10 text-emerald-300",
  LOST: "bg-white/[.06] text-zinc-400 line-through",
};

export function TemperatureBadge({ value, score }: { value: string | null; score?: number | null }) {
  if (!value) return <span className="w-fit text-xs text-zinc-400">Not analyzed</span>;
  return (
    <span
      data-testid="temperature-badge"
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tempStyles[value]}`}
    >
      <span aria-hidden>{tempIcon[value]}</span>
      {value[0] + value.slice(1).toLowerCase()}
      {score != null && <span className="tabular-nums"> · {score}</span>}
    </span>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex w-fit rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[value] ?? statusStyles.NEW}`}>
      {value[0] + value.slice(1).toLowerCase()}
    </span>
  );
}
