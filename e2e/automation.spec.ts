import { test, expect } from "./fixtures";

async function formKeyFor(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/automation");
  const endpoint = await page.getByLabel("Webhook endpoint").textContent();
  return endpoint!.split("/api/forms/")[1];
}

test.describe("Website form automation", () => {
  test("hosted form submission becomes an AI-qualified lead with a logged run", async ({ page, browser, user }) => {
    void user;
    const formKey = await formKeyFor(page);

    // A visitor (no session) fills in the client's contact form.
    const visitor = await browser.newContext();
    const form = await visitor.newPage();
    await form.goto(`/f/${formKey}`);
    await form.getByLabel("Your name").fill("Nora Website");
    await form.getByLabel("Email").fill("nora@shop.com");
    await form.getByLabel("Company (optional)").fill("Nora Shop");
    await form.getByLabel("How can we help?").fill("We need a new online store ASAP, budget is approved and we want a quote.");
    await form.getByRole("button", { name: "Send message" }).click();
    await expect(form.getByRole("status")).toContainText("Thanks — message received!");
    await visitor.close();

    // The owner sees the run and the qualified lead.
    await expect(async () => {
      await page.goto("/dashboard/automation");
      await expect(page.getByRole("list", { name: "Automation runs" })).toContainText("Nora Website", { timeout: 1000 });
    }).toPass({ timeout: 15_000 });
    const runs = page.getByRole("list", { name: "Automation runs" });
    await expect(runs).toContainText("SUCCESS");
    await expect(runs).toContainText("AI: ok");
    await expect(runs).toContainText("Sheets: skipped");
    await expect(runs).toContainText("Telegram: skipped");

    await runs.getByRole("link", { name: "Nora Website" }).click();
    await expect(page.getByText("via website-form")).toBeVisible();
    await expect(page.getByTestId("temperature-badge")).toHaveText(/Hot/);
  });

  test("public form validates input", async ({ page, user }) => {
    void user;
    const formKey = await formKeyFor(page);
    await page.context().clearCookies();
    await page.goto(`/f/${formKey}`);
    await page.getByLabel("Email").fill("nope");
    await page.getByLabel("How can we help?").fill("hi");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Enter a valid email")).toBeVisible();
    await expect(page.getByText("Tell us a bit more (at least 10 characters)")).toBeVisible();
  });

  test("webhook API: JSON, HTML form post, honeypot and unknown key", async ({ page, playwright, baseURL, user }) => {
    void user;
    const formKey = await formKeyFor(page);
    const anon = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": `10.0.0.${Date.now() % 250}` } });

    const ok = await anon.post(`/api/forms/${formKey}`, { data: { name: "Json Lead", email: "j@x.io", message: "Hello, interested in your services." } });
    expect(ok.status()).toBe(202);
    expect(ok.headers()["access-control-allow-origin"]).toBe("*");
    const { leadId } = await ok.json();
    expect(leadId).toBeTruthy();

    const html = await anon.post(`/api/forms/${formKey}`, {
      form: { name: "Form Lead", email: "f@x.io", message: "Sent from a plain HTML form." },
      maxRedirects: 0,
    });
    expect(html.status()).toBe(303);
    expect(html.headers()["location"]).toContain(`/f/${formKey}?sent=1`);

    const bot = await anon.post(`/api/forms/${formKey}`, { data: { name: "Bot", email: "b@x.io", message: "Buy cheap stuff now!!!", website: "spam.biz" } });
    expect(bot.status()).toBe(202);

    expect((await anon.post(`/api/forms/does-not-exist`, { data: {} })).status()).toBe(404);
    expect((await anon.post(`/api/forms/${formKey}`, { data: { name: "", email: "x" } })).status()).toBe(422);

    // Two real leads, the bot submission was dropped.
    const { leads } = await (await page.request.get("/api/leads")).json();
    const names = leads.map((l: { name: string }) => l.name);
    expect(names).toEqual(expect.arrayContaining(["Json Lead", "Form Lead"]));
    expect(names).not.toContain("Bot");
    await anon.dispose();
  });

  test("public endpoint is rate limited", async ({ page, playwright, baseURL, user }) => {
    void user;
    const formKey = await formKeyFor(page);
    const anon = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": "203.0.113.77" } });
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await anon.post(`/api/forms/${formKey}`, { data: { name: "", email: "x" } })).status());
    }
    expect(statuses.slice(0, 10).every((s) => s === 422)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
    await anon.dispose();
  });

  test("integration settings are validated and saved", async ({ page, user }) => {
    void user;
    await page.goto("/dashboard/automation");
    await page.getByLabel("Google Sheets web app URL").fill("https://evil.example.com/hook");
    await page.getByLabel("Telegram bot token").fill("not-a-token");
    await page.getByRole("button", { name: "Save integrations" }).click();
    await expect(page.getByText("Must be a Google Apps Script web app URL")).toBeVisible();
    await expect(page.getByText("Looks like an invalid bot token")).toBeVisible();

    await page.getByLabel("Google Sheets web app URL").fill("https://script.google.com/macros/s/abc123/exec");
    await page.getByLabel("Telegram bot token").fill("");
    await page.getByRole("button", { name: "Save integrations" }).click();
    await expect(page.getByRole("status")).toHaveText("Integrations saved.");
    await page.reload();
    await expect(page.getByLabel("Google Sheets web app URL")).toHaveValue("https://script.google.com/macros/s/abc123/exec");
  });

  test("telegram test requires saved credentials", async ({ page, user }) => {
    void user;
    await page.goto("/dashboard/automation");
    await page.getByRole("button", { name: "Send Telegram test" }).click();
    await expect(page.getByText("Save a bot token and chat ID first.")).toBeVisible();
  });
});
