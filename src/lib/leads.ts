import "server-only";
import { db } from "./db";
import { AnalysisError, analyzeLead, usingRealAi } from "./ai";
import type { LeadInput } from "./validation";

// All lead access is scoped by ownerId — a user can never read or touch another user's leads.

export function listLeads(ownerId: string, opts: { q?: string; status?: string } = {}) {
  const q = opts.q?.trim();
  return db.lead.findMany({
    where: {
      ownerId,
      ...(opts.status ? { status: opts.status as LeadInput["status"] } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { company: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getLead(ownerId: string, id: string) {
  return db.lead.findFirst({ where: { id, ownerId } });
}

export function createLead(ownerId: string, data: LeadInput, source = "manual") {
  return db.lead.create({ data: { ...data, company: data.company || null, ownerId, source } });
}

export async function updateLead(ownerId: string, id: string, data: Partial<LeadInput>) {
  const { count } = await db.lead.updateMany({
    where: { id, ownerId },
    data: { ...data, ...(data.company !== undefined ? { company: data.company || null } : {}) },
  });
  return count > 0 ? getLead(ownerId, id) : null;
}

export async function deleteLead(ownerId: string, id: string) {
  const { count } = await db.lead.deleteMany({ where: { id, ownerId } });
  return count > 0;
}

const HOURLY_LIMIT_PER_USER = Number(process.env.AI_HOURLY_LIMIT_PER_USER ?? 20);
const DAILY_LIMIT_GLOBAL = Number(process.env.AI_DAILY_LIMIT ?? 300);

/** Caps paid Claude calls per user and app-wide; counted in the DB so it holds across serverless instances. */
async function reserveAiCall(ownerId: string) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [mine, total] = await Promise.all([
    db.aiCall.count({ where: { ownerId, createdAt: { gte: hourAgo } } }),
    db.aiCall.count({ where: { createdAt: { gte: dayAgo } } }),
  ]);
  if (mine >= HOURLY_LIMIT_PER_USER) {
    throw new AnalysisError(`AI limit reached (${HOURLY_LIMIT_PER_USER} analyses per hour). Try again later.`);
  }
  if (total >= DAILY_LIMIT_GLOBAL) {
    throw new AnalysisError("The demo's daily AI budget is used up. Try again tomorrow.");
  }
  await db.aiCall.create({ data: { ownerId } });
}

export async function runLeadAnalysis(ownerId: string, id: string) {
  const lead = await getLead(ownerId, id);
  if (!lead) return null;
  if (lead.message.trim() && usingRealAi()) await reserveAiCall(ownerId);
  const result = await analyzeLead(lead);
  return db.lead.update({
    where: { id: lead.id },
    data: {
      aiSummary: result.summary,
      aiTemperature: result.temperature,
      aiNextAction: result.nextAction,
      aiModel: result.model,
      analyzedAt: new Date(),
    },
  });
}

export async function leadStats(ownerId: string) {
  const [byStatus, byTemp, total] = await Promise.all([
    db.lead.groupBy({ by: ["status"], where: { ownerId }, _count: true }),
    db.lead.groupBy({ by: ["aiTemperature"], where: { ownerId }, _count: true }),
    db.lead.count({ where: { ownerId } }),
  ]);
  const temp = (t: string) => byTemp.find((r) => r.aiTemperature === t)?._count ?? 0;
  return {
    total,
    hot: temp("HOT"),
    warm: temp("WARM"),
    cold: temp("COLD"),
    won: byStatus.find((r) => r.status === "WON")?._count ?? 0,
  };
}
