/*
  Warnings:

  - You are about to drop the column `description` on the `knowledge_bases` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `knowledge_bases` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `knowledge_bases` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `knowledge_bases` table. All the data in the column will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `knowledge_bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `knowledge_bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `knowledge_bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `knowledge_bases` table without a default value. This is not possible if the table is not empty.
  - Added the required column `widgetId` to the `knowledge_bases` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_knowledgeBaseId_fkey";

-- DropForeignKey
ALTER TABLE "knowledge_bases" DROP CONSTRAINT "knowledge_bases_organizationId_fkey";

-- DropIndex
DROP INDEX "knowledge_bases_isActive_idx";

-- AlterTable
ALTER TABLE "knowledge_bases" DROP COLUMN "description",
DROP COLUMN "isActive",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "chunks" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "error" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "vectors" JSONB,
ADD COLUMN     "widgetId" TEXT NOT NULL;

-- DropTable
DROP TABLE "documents";

-- CreateIndex
CREATE INDEX "knowledge_bases_widgetId_idx" ON "knowledge_bases"("widgetId");

-- CreateIndex
CREATE INDEX "knowledge_bases_status_idx" ON "knowledge_bases"("status");

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
