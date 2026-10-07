// Demo data: `npm run db:seed` → log in as demo@leadflow.dev / demo12345
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const leads = [
  {
    name: "Sarah Chen", email: "sarah@brightdental.com", company: "Bright Dental", status: "QUALIFIED" as const,
    message: "We need online booking on our website before our new clinic opens next month. Budget is around $2,000. Can we talk this week?",
    aiSummary: "Dental clinic owner needs online booking added to their site before a new clinic opens next month; ~$2k budget.",
    aiTemperature: "HOT" as const, aiNextAction: "Call Sarah this week and send a fixed-price quote for the booking integration.",
  },
  {
    name: "Marco Rossi", email: "marco@rossilogistics.it", company: "Rossi Logistics", status: "CONTACTED" as const,
    message: "Our team copies order emails into Google Sheets by hand. Is there a way to automate this? Not urgent, exploring options.",
    aiSummary: "Logistics company wants to automate copying order emails into Google Sheets; exploring, no deadline.",
    aiTemperature: "WARM" as const, aiNextAction: "Send a 2-minute demo video of an email → Sheets automation and ask about volume.",
  },
  {
    name: "Tom Becker", email: "tom.becker@gmail.com", company: null, status: "NEW" as const,
    message: "Just curious how much a website costs. No plans yet.",
    aiSummary: "Individual asking about general website pricing with no concrete plans.",
    aiTemperature: "COLD" as const, aiNextAction: "Reply with a short pricing guide and add to the monthly newsletter.",
  },
  {
    name: "Aisha Khan", email: "aisha@fitstack.io", company: "FitStack", status: "NEW" as const,
    message: "We're launching our SaaS MVP in 3 weeks and have no automated tests. Looking for someone to write Playwright tests for signup and checkout.",
    aiSummary: null, aiTemperature: null, aiNextAction: null,
  },
];

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@leadflow.dev" },
    update: {},
    create: { name: "Demo User", email: "demo@leadflow.dev", passwordHash: await bcrypt.hash("demo12345", 10) },
  });
  await db.automationRun.deleteMany({ where: { ownerId: user.id } });
  await db.lead.deleteMany({ where: { ownerId: user.id } });
  for (const lead of leads) {
    await db.lead.create({
      data: {
        ...lead,
        ownerId: user.id,
        source: "website-form",
        ...(lead.aiSummary ? { aiModel: "claude-opus-5-5", analyzedAt: new Date() } : {}),
      },
    });
  }
  console.log(`Seeded ${leads.length} leads for demo@leadflow.dev (password: demo12345)`);
}

main().finally(() => db.$disconnect());
