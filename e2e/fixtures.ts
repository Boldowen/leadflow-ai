import { test as base, expect, type Page } from "@playwright/test";

export type TestUser = { name: string; email: string; password: string };

export function newUser(): TestUser {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { name: "QA Tester", email: `qa+${id}@example.com`, password: "Sup3r-secret!" };
}

export async function registerViaUi(page: Page, user: TestUser) {
  await page.goto("/register");
  await page.getByLabel("Name").fill(user.name);
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

export async function createLeadViaUi(
  page: Page,
  lead: { name: string; email: string; company?: string; message?: string },
) {
  await page.goto("/dashboard/leads/new");
  await page.getByLabel("Name").fill(lead.name);
  await page.getByLabel("Email").fill(lead.email);
  if (lead.company) await page.getByLabel("Company").fill(lead.company);
  if (lead.message) await page.getByLabel("Message from lead").fill(lead.message);
  await page.getByRole("button", { name: "Create lead" }).click();
  await expect(page).toHaveURL(/\/dashboard\/leads\/[a-z0-9]+$/);
  await expect(page.getByRole("heading", { level: 1, name: lead.name })).toBeVisible();
}

/** `user` = a freshly registered account; the page is already signed in as that user. */
export const test = base.extend<{ user: TestUser }>({
  user: async ({ page }, use) => {
    const user = newUser();
    await registerViaUi(page, user);
    await use(user);
  },
});

export { expect };
