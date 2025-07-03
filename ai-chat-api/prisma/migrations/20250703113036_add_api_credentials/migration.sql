-- CreateTable
CREATE TABLE "api_credentials" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "lastUsed" TIMESTAMP(3),
    "lastRotated" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_credentials_organizationId_idx" ON "api_credentials"("organizationId");

-- CreateIndex
CREATE INDEX "api_credentials_service_idx" ON "api_credentials"("service");

-- CreateIndex
CREATE INDEX "api_credentials_isActive_idx" ON "api_credentials"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "api_credentials_organizationId_service_name_key" ON "api_credentials"("organizationId", "service", "name");

-- AddForeignKey
ALTER TABLE "api_credentials" ADD CONSTRAINT "api_credentials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
