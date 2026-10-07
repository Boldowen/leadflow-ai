import "server-only";

const TIMEOUT_MS = 8000;

export class IntegrationError extends Error {}

/** Sends a message via the Telegram Bot API. */
export async function sendTelegram(botToken: string, chatId: string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { description?: string } | null;
    throw new IntegrationError(`Telegram ${res.status}: ${body?.description ?? res.statusText}`);
  }
}

/** Appends a row through a Google Apps Script web app (see docs/google-sheets-apps-script.js). */
export async function appendToSheet(webhookUrl: string, row: Record<string, string>) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(row),
    redirect: "follow", // Apps Script answers with a 302 to googleusercontent.com
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new IntegrationError(`Google Sheets ${res.status}: ${res.statusText}`);
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
