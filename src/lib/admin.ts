import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "./dal";
import { db } from "./db";
import { DAILY_LIMIT_GLOBAL } from "./leads";

// Cross-user reads live only here, and every function checks the role itself.
// Selects are explicit: no password hashes, form keys, integration secrets or lead contents.
// Mutations live in app/admin/actions.ts and check the role again there.

export const USERS_PER_PAGE = 25;

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);
const notSuccessful = { status: { in: ["FAILED", "PARTIAL"] } } satisfies Prisma.AutomationRunWhereInput;

export async function adminStats() {
  await requireAdmin();
  const week = daysAgo(7);
  const [users, newUsers, leads, newLeads, aiDay, aiMonth, runs, problemRuns] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: week } } }),
    db.lead.count(),
    db.lead.count({ where: { createdAt: { gte: week } } }),
    db.aiCall.count({ where: { createdAt: { gte: daysAgo(1) } } }),
    db.aiCall.count({ where: { createdAt: { gte: daysAgo(30) } } }),
    db.automationRun.count({ where: { createdAt: { gte: week } } }),
    db.automationRun.count({ where: { createdAt: { gte: week }, ...notSuccessful } }),
  ]);
  return { users, newUsers, leads, newLeads, aiDay, aiMonth, aiDailyLimit: DAILY_LIMIT_GLOBAL, runs, problemRuns };
}

export async function listUsers(opts: { q?: string; page?: number } = {}) {
  await requireAdmin();
  const q = opts.q?.trim();
  const where: Prisma.UserWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
    : {};

  const total = await db.user.count({ where });
  const pages = Math.max(1, Math.ceil(total / USERS_PER_PAGE));
  const page = Math.min(Math.max(1, opts.page ?? 1), pages);

  const users = await db.user.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * USERS_PER_PAGE,
    take: USERS_PER_PAGE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          leads: true,
          aiCalls: { where: { createdAt: { gte: daysAgo(30) } } },
          automationRuns: { where: { createdAt: { gte: daysAgo(7) }, ...notSuccessful } },
        },
      },
    },
  });
  return { users, total, page, pages };
}

/** Latest runs where at least one step failed, across all users. */
export async function listProblemRuns(take = 20) {
  await requireAdmin();
  return db.automationRun.findMany({
    where: notSuccessful,
    orderBy: { createdAt: "desc" },
    take,
    select: { id: true, status: true, steps: true, createdAt: true, owner: { select: { name: true, email: true } } },
  });
}

/** One account for the admin detail page. Still no lead contents or integration secrets. */
export async function getUserDetail(id: string) {
  await requireAdmin();
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      telegramChatId: true,
      sheetsWebhookUrl: true,
      _count: {
        select: {
          leads: true,
          aiCalls: { where: { createdAt: { gte: daysAgo(30) } } },
          automationRuns: { where: { createdAt: { gte: daysAgo(7) }, ...notSuccessful } },
        },
      },
    },
  });
}

export async function listAuditLog(take = 20) {
  await requireAdmin();
  return db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take, select: { id: true, actorEmail: true, action: true, targetEmail: true, detail: true, createdAt: true } });
}
