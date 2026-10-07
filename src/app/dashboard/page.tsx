import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge, TemperatureBadge } from "@/components/badges";
import { ButtonLink, Card } from "@/components/ui";
import { requireUser } from "@/lib/dal";
import { leadStats, listLeads } from "@/lib/leads";
import { LEAD_STATUSES } from "@/lib/validation";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "";

  const [leads, stats] = await Promise.all([listLeads(user.id, { q, status }), leadStats(user.id)]);
  const filtered = Boolean(q || status);

  const cards = [
    { label: "Total leads", value: stats.total },
    { label: "Hot", value: stats.hot, accent: "text-red-600" },
    { label: "Warm", value: stats.warm, accent: "text-amber-600" },
    { label: "Won", value: stats.won, accent: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-slate-600">Hi {user.name.split(" ")[0]} — here is your pipeline.</p>
        </div>
        <ButtonLink href="/dashboard/leads/new">+ New lead</ButtonLink>
      </div>

      <section aria-label="Stats" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{c.label}</p>
            <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.accent ?? ""}`} data-testid={`stat-${c.label.toLowerCase().replace(" ", "-")}`}>
              {c.value}
            </p>
          </Card>
        ))}
      </section>

      <Card>
        <form className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row" role="search">
          <input name="q" defaultValue={q} placeholder="Search name, email, company…" aria-label="Search leads" className="input sm:max-w-xs" />
          <select name="status" defaultValue={status} aria-label="Filter by status" className="input sm:w-44">
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0] + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Filter</button>
          {filtered && (
            <Link href="/dashboard" className="self-center text-sm text-slate-500 hover:underline">
              Clear
            </Link>
          )}
        </form>

        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-medium">{filtered ? "No leads match your filters." : "No leads yet."}</p>
            {!filtered && (
              <p className="mt-1 text-sm text-slate-500">Add your first lead and let AI qualify it.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100" aria-label="Lead list">
            {leads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/dashboard/leads/${lead.id}`} className="grid gap-1 px-4 py-3 hover:bg-slate-50 sm:grid-cols-[1.5fr_1.5fr_auto_auto] sm:items-center sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{lead.name}</p>
                    <p className="truncate text-sm text-slate-500">{lead.company ?? "—"}</p>
                  </div>
                  <p className="truncate text-sm text-slate-600">{lead.aiSummary ?? lead.email}</p>
                  <StatusBadge value={lead.status} />
                  <TemperatureBadge value={lead.aiTemperature} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
