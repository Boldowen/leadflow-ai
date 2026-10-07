const tempStyles: Record<string, string> = {
  HOT: "bg-red-50 text-red-700 ring-red-600/20",
  WARM: "bg-amber-50 text-amber-700 ring-amber-600/20",
  COLD: "bg-sky-50 text-sky-700 ring-sky-600/20",
};
const tempIcon: Record<string, string> = { HOT: "🔥", WARM: "☀️", COLD: "❄️" };

const statusStyles: Record<string, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONTACTED: "bg-indigo-50 text-indigo-700",
  QUALIFIED: "bg-violet-50 text-violet-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-slate-100 text-slate-500 line-through",
};

export function TemperatureBadge({ value }: { value: string | null }) {
  if (!value) return <span className="w-fit text-xs text-slate-400">Not analyzed</span>;
  return (
    <span
      data-testid="temperature-badge"
      className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tempStyles[value]}`}
    >
      <span aria-hidden>{tempIcon[value]}</span>
      {value[0] + value.slice(1).toLowerCase()}
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
