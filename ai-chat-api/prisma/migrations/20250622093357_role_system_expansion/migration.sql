-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'org_admin', 'editor', 'viewer');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "settings" JSONB DEFAULT '{"dashboard":{"layout":[]}}';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['viewer']::"Role"[];

-- CreateIndex
CREATE INDEX "users_organizationId_idx" ON "users"("organizationId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
