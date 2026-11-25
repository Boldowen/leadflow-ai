// Grants or revokes admin from the command line — needed for the first admin; after that admins can
// also manage roles in /admin. Emails aren't verified at sign-up, so there is deliberately no email allowlist.
//   npm run admin -- grant you@example.com
//   npm run admin -- revoke you@example.com
//   npm run admin -- list
// Uses DATABASE_URL (from .env unless already set in the shell).
import "dotenv/config";
import net from "node:net";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Their passwords are public. The old address may still exist in deployed databases.
// Remote databases can be >250 ms away; Node's default per-address connect timeout would then fail every attempt.
net.setDefaultAutoSelectFamilyAttemptTimeout(2000);

const DEMO_EMAILS = ["demo@emberza.dev", "demo@leadflow.dev"];

async function main() {
  const [command, rawEmail] = process.argv.slice(2);
  const email = rawEmail?.trim().toLowerCase();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL");
  if (command !== "list" && !(["grant", "revoke"].includes(command) && email)) {
    throw new Error("Usage: npm run admin -- <grant|revoke> <email>  |  npm run admin -- list");
  }
  if (command === "grant" && email && DEMO_EMAILS.includes(email)) {
    throw new Error("Refusing: the demo account's password is public.");
  }

  const connectionString = url.replace(/sslmode=require\b/, "sslmode=verify-full");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    console.log(`Database: ${new URL(url).host}`);
    if (command !== "list") {
      const role = command === "grant" ? "ADMIN" : "USER";
      const { count } = await db.user.updateMany({ where: { email }, data: { role } });
      if (count === 0) throw new Error(`No account with email ${email} — register it in the app first.`);
      console.log(`${email} is now ${role}`);
    }
    const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { email: true }, orderBy: { email: "asc" } });
    console.log(`Admins: ${admins.map((a) => a.email).join(", ") || "none"}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
