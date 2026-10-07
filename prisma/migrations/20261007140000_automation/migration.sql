-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- AlterTable: add formKey as nullable, backfill existing users, then make it required
ALTER TABLE "User" ADD COLUMN "formKey" TEXT,
ADD COLUMN "sheetsWebhookUrl" TEXT,
ADD COLUMN "telegramBotToken" TEXT,
ADD COLUMN "telegramChatId" TEXT;

UPDATE "User" SET "formKey" = 'fk' || md5(random()::text || id) WHERE "formKey" IS NULL;

ALTER TABLE "User" ALTER COLUMN "formKey" SET NOT NULL;

-- CreateTable
CREATE TABLE "AutomationRun" (
    "id" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL,
    "steps" JSONB NOT NULL,
    "ownerId" TEXT NOT NULL,
    "leadId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AutomationRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AutomationRun_ownerId_createdAt_idx" ON "AutomationRun"("ownerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_formKey_key" ON "User"("formKey");

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationRun" ADD CONSTRAINT "AutomationRun_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
