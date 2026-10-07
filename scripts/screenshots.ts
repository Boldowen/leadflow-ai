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

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await mobile.context().addCookies(await page.context().cookies());
  await mobile.goto(`${base}/dashboard`);
  await mobile.getByRole("list", { name: "Lead list" }).waitFor();
  await mobile.screenshot({ path: `${out}/mobile.png` });

  await browser.close();
}

main();
