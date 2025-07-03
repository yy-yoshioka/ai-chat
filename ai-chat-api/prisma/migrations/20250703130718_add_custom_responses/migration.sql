-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('GREETING', 'FALLBACK', 'ERROR', 'MAINTENANCE', 'RATE_LIMIT', 'UNAUTHORIZED', 'KNOWLEDGE_NOT_FOUND', 'CLARIFICATION', 'CONFIRMATION', 'CUSTOM');

-- CreateTable
CREATE TABLE "custom_responses" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResponseType" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "conditions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_custom_responses" (
    "id" TEXT NOT NULL,
    "widgetId" TEXT NOT NULL,
    "customResponseId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "overrideContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_custom_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_responses_organizationId_idx" ON "custom_responses"("organizationId");

-- CreateIndex
CREATE INDEX "custom_responses_type_idx" ON "custom_responses"("type");

-- CreateIndex
CREATE INDEX "custom_responses_isActive_idx" ON "custom_responses"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "custom_responses_organizationId_name_key" ON "custom_responses"("organizationId", "name");

-- CreateIndex
CREATE INDEX "widget_custom_responses_widgetId_idx" ON "widget_custom_responses"("widgetId");

-- CreateIndex
CREATE INDEX "widget_custom_responses_customResponseId_idx" ON "widget_custom_responses"("customResponseId");

-- CreateIndex
CREATE UNIQUE INDEX "widget_custom_responses_widgetId_customResponseId_key" ON "widget_custom_responses"("widgetId", "customResponseId");

-- AddForeignKey
ALTER TABLE "custom_responses" ADD CONSTRAINT "custom_responses_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_custom_responses" ADD CONSTRAINT "widget_custom_responses_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_custom_responses" ADD CONSTRAINT "widget_custom_responses_customResponseId_fkey" FOREIGN KEY ("customResponseId") REFERENCES "custom_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
