import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // pg already treats sslmode=require as verify-full; say so explicitly to silence its deprecation warning.
  const connectionString = process.env.DATABASE_URL?.replace(/sslmode=require\b/, "sslmode=verify-full");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in dev.
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
