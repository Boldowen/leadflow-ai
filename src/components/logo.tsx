import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
      <span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-sm text-white">L</span>
      LeadFlow <span className="text-indigo-600">AI</span>
    </Link>
  );
}
