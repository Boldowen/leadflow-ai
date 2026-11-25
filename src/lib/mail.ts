import "server-only";
import { appendFile } from "node:fs/promises";

export type Mail = { to: string; subject: string; text: string; html: string };

export class MailNotConfiguredError extends Error {}

/** True when emails actually leave the server (Resend configured). */
export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Sends through Resend's HTTP API (https://resend.com) when RESEND_API_KEY and EMAIL_FROM are set.
 * The E2E suite sets TEST_MAIL_CAPTURE_FILE to read messages; it is ignored on Vercel.
 * In local development without a provider, the message is printed to the server console.
 */
export async function sendMail(mail: Mail) {
  const capture = process.env.TEST_MAIL_CAPTURE_FILE;
  if (capture && !process.env.VERCEL) {
    await appendFile(capture, JSON.stringify({ ...mail, at: new Date().toISOString() }) + "\n");
    return;
  }
  if (mailConfigured()) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, html: mail.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[mail] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return;
  }
  throw new MailNotConfiguredError("Email is not configured: set RESEND_API_KEY and EMAIL_FROM.");
}
