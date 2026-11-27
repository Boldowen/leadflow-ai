import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { adminStats, listAuditLog, listProblemRuns, listUsers } from "@/lib/admin";
import type { StepResult } from "@/lib/automation";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const stepLabel = { ai: "AI", sheets: "Sheets", telegram: "Telegram" } as const;
const runStyle = { SUCCESS: "text-emerald-300", PARTIAL: "text-amber-300", FAILED: "text-red-300" } as const;

const n = (value: number) => value.toLocaleString("en-US");

function usersHref(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const requested = typeof sp.page === "string" && /^\d{1,6}$/.test(sp.page) ? Number(sp.page) : 1;

  const [stats, { users, total, page, pages }, runs, audit] = await Promise.all([
    adminStats(),
    listUsers({ q, page: requested }),
    listProblemRuns(),
    listAuditLog(),
  ]);

  const cards = [
    { id: "users", label: "Users", value: n(stats.users), detail: `+${n(stats.newUsers)} in 7 days` },
    { id: "leads", label: "Leads", value: n(stats.leads), detail: `+${n(stats.newLeads)} in 7 days` },
    { id: "ai-calls", label: "AI calls, 24 h", value: `${n(stats.aiDay)} / ${n(stats.aiDailyLimit)}`, detail: `${n(stats.aiMonth)} in 30 days` },
    { id: "problem-runs", label: "Problem runs, 7 days", value: n(stats.problemRuns), detail: `of ${n(stats.runs)} automation runs` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-sm text-zinc-400">Usage across all accounts. Lead contents and integration secrets stay private to their owners.</p>
      </div>

      {sp.deleted === "1" && <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Account deleted.</p>}

      <section aria-label="Stats" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.id} className="p-4">
            <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold" data-testid={`admin-stat-${c.id}`}>{c.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{c.detail}</p>
          </Card>
        ))}
      </section>

      <Card>
        <div className="flex flex-col gap-3 border-b border-white/[.08] p-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Users</h2>
          <form className="flex items-center gap-3" role="search">
            <input name="q" defaultValue={q} placeholder="Search name or email…" aria-label="Search users" className="input sm:w-64" />
            <button className="rounded-xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] px-4 py-2 text-sm font-medium text-white">Search</button>
            {q && <Link href="/admin" className="text-sm text-zinc-400 hover:underline">Clear</Link>}
          </form>
        </div>

        {users.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-400">No users match your search.</p>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Users table">
            <table className="w-full min-w-[44rem] text-left text-sm" aria-label="Users">
              <thead className="text-xs tracking-wide text-zinc-400 uppercase">
                <tr className="border-b border-white/[.08]">
                  <th scope="col" className="px-4 py-2 font-medium">User</th>
                  <th scope="col" className="px-4 py-2 font-medium">Role</th>
                  <th scope="col" className="px-4 py-2 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Leads</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">AI calls, 30 d</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Problem runs, 7 d</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[.06]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="max-w-64 px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="block truncate font-medium text-indigo-300 hover:underline">{u.name}</Link>
                      <p className="truncate text-zinc-400" title={u.email}>{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-indigo-500/15 text-indigo-300" : "bg-white/[.06] text-zinc-300"}`}>
                        {u.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-400">{u.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{n(u._count.leads)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{n(u._count.aiCalls)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{n(u._count.automationRuns)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Users pages" className="flex items-center justify-between border-t border-white/[.08] px-4 py-3 text-sm">
            <span className="text-zinc-400">Page {page} of {pages} · {n(total)} users</span>
            <span className="flex gap-4 font-medium text-indigo-300">
              {page > 1 && <Link href={usersHref(q, page - 1)} className="hover:underline">Previous</Link>}
              {page < pages && <Link href={usersHref(q, page + 1)} className="hover:underline">Next</Link>}
            </span>
          </nav>
        )}
      </Card>

      <Card>
        <div className="border-b border-white/[.08] p-4">
          <h2 className="font-semibold">Latest automation problems</h2>
          <p className="text-sm text-zinc-400">The most recent runs where at least one step failed.</p>
        </div>
        {runs.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-400">No failed runs.</p>
        ) : (
          <ul aria-label="Problem runs" className="divide-y divide-white/[.06]">
            {runs.map((run) => {
              const failed = (run.steps as unknown as StepResult[]).filter((s) => s.status === "failed");
              return (
                <li key={run.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[5rem_1fr_2fr_auto] sm:items-baseline sm:gap-4">
                  <span className={`font-semibold ${runStyle[run.status]}`}>{run.status}</span>
                  <span className="min-w-0 truncate" title={run.owner.email}>{run.owner.email}</span>
                  <span className="min-w-0 break-words text-zinc-400">
                    {failed.map((s) => `${stepLabel[s.step]}: ${s.detail?.slice(0, 200) ?? "failed"}`).join(" · ")}
                  </span>
                  <time dateTime={run.createdAt.toISOString()} className="text-xs whitespace-nowrap text-zinc-400">
                    {run.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <div className="border-b border-white/[.08] p-4">
          <h2 className="font-semibold">Audit log</h2>
          <p className="text-sm text-zinc-400">Every change made from this admin area.</p>
        </div>
        {audit.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-400">No admin actions yet.</p>
        ) : (
          <ul aria-label="Audit log" className="divide-y divide-white/[.06]">
            {audit.map((a) => (
              <li key={a.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-4">
                <span className="font-medium">{a.action.replace(/_/g, " ")}</span>
                <span className="min-w-0 break-words text-zinc-400">
                  {a.actorEmail} → {a.targetEmail ?? "—"}
                  {a.detail ? ` · ${a.detail}` : ""}
                </span>
                <time dateTime={a.createdAt.toISOString()} className="text-xs whitespace-nowrap text-zinc-400">
                  {a.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
