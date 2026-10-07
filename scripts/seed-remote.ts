// Seeds a deployed instance through its own UI + REST API (no DB access needed). Safe to re-run.
// BASE_URL=https://your-app.vercel.app npx tsx scripts/seed-remote.ts
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL;
if (!base) throw new Error("Set BASE_URL");
const demo = { name: "Demo User", email: "demo@leadflow.dev", password: "demo12345" };

const leads = [
  { name: "Sarah Chen", email: "sarah@brightdental.com", company: "Bright Dental", status: "QUALIFIED",
    message: "We need online booking on our website before our new clinic opens next month. Budget is around $2,000. Can we get a quote and talk this week?" },
  { name: "Marco Rossi", email: "marco@rossilogistics.it", company: "Rossi Logistics", status: "CONTACTED",
    message: "Our team copies order emails into Google Sheets by hand. Is there a way to automate this? Not urgent, exploring options." },
  { name: "Tom Becker", email: "tom.becker@gmail.com", company: "", status: "NEW",
    message: "Just looking — curious how much a website costs. No budget yet, maybe later." },
  { name: "Aisha Khan", email: "aisha@fitstack.io", company: "FitStack", status: "NEW",
    message: "We're launching our SaaS MVP in 3 weeks and have no automated tests. Looking for someone to write Playwright tests for signup and checkout." },
];

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${base}/login`);
  await page.getByLabel("Email").fill(demo.email);
  await page.getByLabel("Password").fill(demo.password);
  await page.getByRole("button", { name: "Log in" }).click();
  const loggedIn = await page.waitForURL("**/dashboard", { timeout: 8000 }).then(() => true, () => false);
  if (!loggedIn) {
    await page.goto(`${base}/register`);
    await page.getByLabel("Name").fill(demo.name);
    await page.getByLabel("Email").fill(demo.email);
    await page.getByLabel("Password").fill(demo.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await page.waitForURL("**/dashboard");
    console.log("Registered demo user");
  }

  const api = page.request;
  const existing = (await (await api.get(`${base}/api/leads`)).json()).leads as { id: string }[];
  for (const l of existing) await api.delete(`${base}/api/leads/${l.id}`);

  for (const lead of leads) {
    const { lead: created } = await (await api.post(`${base}/api/leads`, { data: lead })).json();
    if (lead.name !== "Aisha Khan") await api.post(`${base}/api/leads/${created.id}/analyze`);
  }

  // One lead through the public website form, so the automation run log has an entry.
  await page.goto(`${base}/dashboard/automation`);
  const formKey = (await page.getByLabel("Webhook endpoint").textContent())!.split("/api/forms/")[1];
  const res = await api.post(`${base}/api/forms/${formKey}`, {
    data: { name: "Daniel Park", email: "daniel@parkfitness.com", company: "Park Fitness",
      message: "We want online class booking with payments. Budget approved, need it ASAP — can you send a quote?" },
  });
  console.log(`Seeded ${leads.length} leads + 1 form submission (${res.status()}) on ${base}`);
  await browser.close();
}

main();
