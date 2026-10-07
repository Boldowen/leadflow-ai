import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { AnalysisError } from "./ai";
import { db } from "./db";
import { appendToSheet, escapeHtml, sendTelegram } from "./integrations";
import { runLeadAnalysis } from "./leads";

export type StepResult = { step: "ai" | "sheets" | "telegram"; status: "ok" | "skipped" | "failed"; detail?: string; ms: number };

const TEMP_EMOJI = { HOT: "🔥", WARM: "☀️", COLD: "❄️" } as const;

async function timed(step: StepResult["step"], fn: () => Promise<string | void>): Promise<StepResult> {
  const start = Date.now();
  try {
    const detail = await fn();
    return { step, status: "ok", ...(detail ? { detail } : {}), ms: Date.now() - start };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error";
    if (!(err instanceof AnalysisError)) console.error(`automation step ${step} failed`, err);
    return { step, status: "failed", detail, ms: Date.now() - start };
  }
}

const skipped = (step: StepResult["step"], detail: string): StepResult => ({ step, status: "skipped", detail, ms: 0 });

/**
 * Website form workflow: AI qualification → Google Sheets row → Telegram alert.
 * Each step is isolated: a failing integration never loses the lead, and every run is logged.
 */
export async function runInboundWorkflow(ownerId: string, leadId: string) {
  const owner = await db.user.findUniqueOrThrow({
    where: { id: ownerId },
    select: { telegramBotToken: true, telegramChatId: true, sheetsWebhookUrl: true },
  });

  const steps: StepResult[] = [];
  steps.push(
    await timed("ai", async () => {
      const lead = await runLeadAnalysis(ownerId, leadId);
      return lead?.aiTemperature ?? undefined;
    }),
  );

  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");

  steps.push(
    owner.sheetsWebhookUrl
      ? await timed("sheets", () =>
          appendToSheet(owner.sheetsWebhookUrl!, {
            createdAt: lead.createdAt.toISOString(),
            name: lead.name,
            email: lead.email,
            company: lead.company ?? "",
            message: lead.message,
            temperature: lead.aiTemperature ?? "",
            summary: lead.aiSummary ?? "",
            nextAction: lead.aiNextAction ?? "",
          }),
        )
      : skipped("sheets", "Not configured"),
  );

  steps.push(
    owner.telegramBotToken && owner.telegramChatId
      ? await timed("telegram", () => {
          const temp = lead.aiTemperature;
          const lines = [
            `<b>${temp ? `${TEMP_EMOJI[temp]} ${temp}` : "📩 New"} lead</b>`,
            `${escapeHtml(lead.name)}${lead.company ? ` (${escapeHtml(lead.company)})` : ""} · ${escapeHtml(lead.email)}`,
            lead.aiSummary ? `\n<b>Summary:</b> ${escapeHtml(lead.aiSummary)}` : `\n${escapeHtml(lead.message.slice(0, 300))}`,
            lead.aiNextAction ? `<b>Next:</b> ${escapeHtml(lead.aiNextAction)}` : null,
            appUrl ? `\n${appUrl}/dashboard/leads/${lead.id}` : null,
          ];
          return sendTelegram(owner.telegramBotToken!, owner.telegramChatId!, lines.filter((l) => l !== null).join("\n"));
        })
      : skipped("telegram", "Not configured"),
  );

  const ran = steps.filter((s) => s.status !== "skipped");
  const failed = ran.filter((s) => s.status === "failed");
  const status = failed.length === 0 ? "SUCCESS" : failed.length === ran.length ? "FAILED" : "PARTIAL";

  return db.automationRun.create({
    data: { ownerId, leadId, status, steps: steps as unknown as Prisma.InputJsonValue },
  });
}

export function listRuns(ownerId: string, take = 10) {
  return db.automationRun.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    take,
    include: { lead: { select: { id: true, name: true } } },
  });
}

// --- Simple fixed-window rate limiter for the public form endpoint (per instance) ---
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    if (hits.size > 10_000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
