import "server-only";
import { db } from "./db";
import { analyzeLead } from "./ai";
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

export async function runLeadAnalysis(ownerId: string, id: string) {
  const lead = await getLead(ownerId, id);
  if (!lead) return null;
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
