// Captures README screenshots. Needs the app running + seeded: npm run db:seed && npm start -- -p 3100
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL ?? "http://localhost:3100";
const out = "docs/screenshots";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

  await page.goto(base);
  await page.screenshot({ path: `${out}/landing.png` });

  await page.goto(`${base}/login`);
  await page.getByLabel("Email").fill("demo@leadflow.dev");
  await page.getByLabel("Password").fill("demo12345");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("**/dashboard");
  await page.getByRole("list", { name: "Lead list" }).waitFor();
  await page.screenshot({ path: `${out}/dashboard.png` });

  await page.getByRole("link", { name: /Sarah Chen/ }).click();
  await page.getByTestId("ai-result").waitFor();
  await page.screenshot({ path: `${out}/lead-detail.png`, fullPage: true });

  // Automation: submit the hosted form like a website visitor, then show the run log.
  await page.goto(`${base}/dashboard/automation`);
  const endpoint = (await page.getByLabel("Webhook endpoint").textContent())!;
  const formKey = endpoint.split("/api/forms/")[1];
  const visitor = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });
  await visitor.goto(`${base}/f/${formKey}`);
  await visitor.getByLabel("Your name").fill("Daniel Park");
  await visitor.getByLabel("Email").fill("daniel@parkfitness.com");
  await visitor.getByLabel("Company (optional)").fill("Park Fitness");
  await visitor.getByLabel("How can we help?").fill("We want online class booking with payments. Budget approved, need it ASAP — can you send a quote?");
  await visitor.screenshot({ path: `${out}/public-form.png` });
  await visitor.getByRole("button", { name: "Send message" }).click();
  await visitor.getByRole("status").waitFor();
  await page.waitForTimeout(1500);
  await page.reload();
  await page.getByRole("list", { name: "Automation runs" }).waitFor();
  await page.screenshot({ path: `${out}/automation.png`, fullPage: true });
  await page.goto(`${base}/dashboard`);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobile.context().addCookies(await page.context().cookies());
  await mobile.goto(`${base}/dashboard`);
  await mobile.getByRole("list", { name: "Lead list" }).waitFor();
  await mobile.screenshot({ path: `${out}/mobile.png` });

  await browser.close();
}

main();
