"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { IntegrationError, sendTelegram } from "@/lib/integrations";
import { fieldErrors, integrationsSchema } from "@/lib/validation";

export type IntegrationsState = { errors?: Record<string, string>; saved?: boolean; values?: Record<string, string> } | undefined;

export async function saveIntegrationsAction(_prev: IntegrationsState, formData: FormData): Promise<IntegrationsState> {
  const user = await requireUser();
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = integrationsSchema.safeParse(raw);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: raw };

  const { telegramBotToken, telegramChatId } = parsed.data;
  if (Boolean(telegramBotToken) !== Boolean(telegramChatId)) {
    return { errors: { telegramChatId: "Telegram needs both a bot token and a chat ID" }, values: raw };
  }
  await db.user.update({ where: { id: user.id }, data: parsed.data });
  revalidatePath("/dashboard/automation");
  return { saved: true };
}

export type TestState = { ok?: boolean; error?: string } | undefined;

export async function sendTelegramTestAction(): Promise<TestState> {
  const user = await requireUser();
  const cfg = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { telegramBotToken: true, telegramChatId: true } });
  if (!cfg.telegramBotToken || !cfg.telegramChatId) return { error: "Save a bot token and chat ID first." };
  try {
    await sendTelegram(cfg.telegramBotToken, cfg.telegramChatId, "✅ LeadFlow AI is connected. New website leads will appear here.");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof IntegrationError ? err.message : "Could not reach Telegram." };
  }
}

export async function rotateFormKeyAction() {
  const user = await requireUser();
  const { randomBytes } = await import("node:crypto");
  await db.user.update({ where: { id: user.id }, data: { formKey: `fk${randomBytes(16).toString("hex")}` } });
  revalidatePath("/dashboard/automation");
}
