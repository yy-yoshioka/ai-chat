-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "trialEndsAt" TIMESTAMP(3),
ADD COLUMN     "trialExpired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialStartedAt" TIMESTAMP(3);
