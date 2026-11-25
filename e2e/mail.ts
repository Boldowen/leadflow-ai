import { readFile } from "node:fs/promises";
import { expect } from "@playwright/test";
import { MAIL_CAPTURE_FILE } from "../playwright.config";

type Mail = { to: string; subject: string; text: string; at: string };

/** Waits for the newest email sent to `to` and returns it. */
export async function latestMailTo(to: string, after = 0): Promise<Mail> {
  let found: Mail | undefined;
  await expect(async () => {
    const lines = (await readFile(MAIL_CAPTURE_FILE, "utf8").catch(() => "")).trim().split("\n").filter(Boolean);
    found = lines.map((l) => JSON.parse(l) as Mail).filter((m) => m.to === to && Date.parse(m.at) >= after).at(-1);
    expect(found).toBeTruthy();
  }).toPass({ timeout: 10_000 });
  return found!;
}

export function resetLinkFrom(mail: Mail) {
  const link = mail.text.match(/https?:\/\/\S+\/reset-password\?token=[\w-]+/)?.[0];
  expect(link, "reset link in email").toBeTruthy();
  return new URL(link!);
}
