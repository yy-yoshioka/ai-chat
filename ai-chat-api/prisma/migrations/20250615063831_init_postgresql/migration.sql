-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('free', 'pro', 'enterprise');

-- CreateEnum
CREATE TYPE "DocumentSourceType" AS ENUM ('pdf', 'url', 'markdown', 'csv', 'zendesk', 'intercom', 'manual');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'free',
    "organizationId" TEXT,
    "stripeCustomerId" TEXT,
    "subscriptionId" TEXT,
    "subscriptionStatus" TEXT DEFAULT 'inactive',
    "tokenBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "widgetKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "accentColor" TEXT NOT NULL DEFAULT '#007bff',
    "logoUrl" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "primaryColor" TEXT NOT NULL DEFAULT '#007bff',
    "secondaryColor" TEXT NOT NULL DEFAULT '#6c757d',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#212529',
    "borderRadius" INTEGER NOT NULL DEFAULT 8,
    "fontFamily" TEXT NOT NULL DEFAULT 'system-ui',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(1536),
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "widgetId" TEXT,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "tokens" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "widgetId" TEXT,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT,
    "properties" JSONB,
    "anonymousId" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "pageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_bases" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_bases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "sourceType" "DocumentSourceType" NOT NULL,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "embedding" vector(1536),
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "wordCount" INTEGER,
    "lastCrawledAt" TIMESTAMP(3),
    "sourceMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggerRegex" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "newTab" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "lastClickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "link_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unanswered_messages" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION,
    "suggestedQuestion" TEXT,
    "suggestedAnswer" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "firstAskedAt" TIMESTAMP(3) NOT NULL,
    "lastAskedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unanswered_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_email_key" ON "companies"("email");

-- CreateIndex
CREATE INDEX "companies_organizationId_idx" ON "companies"("organizationId");

-- CreateIndex
CREATE INDEX "companies_stripeCustomerId_idx" ON "companies"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "widgets_widgetKey_key" ON "widgets"("widgetKey");

-- CreateIndex
CREATE INDEX "widgets_widgetKey_idx" ON "widgets"("widgetKey");

-- CreateIndex
CREATE INDEX "widgets_companyId_idx" ON "widgets"("companyId");

-- CreateIndex
CREATE INDEX "widgets_isActive_idx" ON "widgets"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- CreateIndex
CREATE INDEX "faqs_organizationId_idx" ON "faqs"("organizationId");

-- CreateIndex
CREATE INDEX "faqs_isActive_idx" ON "faqs"("isActive");

-- CreateIndex
CREATE INDEX "faqs_weight_idx" ON "faqs"("weight");

-- CreateIndex
CREATE INDEX "faqs_timesUsed_idx" ON "faqs"("timesUsed");

-- CreateIndex
CREATE INDEX "chat_logs_userId_idx" ON "chat_logs"("userId");

-- CreateIndex
CREATE INDEX "chat_logs_widgetId_idx" ON "chat_logs"("widgetId");

-- CreateIndex
CREATE INDEX "chat_logs_createdAt_idx" ON "chat_logs"("createdAt");

-- CreateIndex
CREATE INDEX "usage_companyId_idx" ON "usage"("companyId");

-- CreateIndex
CREATE INDEX "usage_date_idx" ON "usage"("date");

-- CreateIndex
CREATE UNIQUE INDEX "usage_companyId_date_key" ON "usage"("companyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "organizations_slug_idx" ON "organizations"("slug");

-- CreateIndex
CREATE INDEX "events_companyId_idx" ON "events"("companyId");

-- CreateIndex
CREATE INDEX "events_widgetId_idx" ON "events"("widgetId");

-- CreateIndex
CREATE INDEX "events_userId_idx" ON "events"("userId");

-- CreateIndex
CREATE INDEX "events_eventType_idx" ON "events"("eventType");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "events_sessionId_idx" ON "events"("sessionId");

-- CreateIndex
CREATE INDEX "knowledge_bases_organizationId_idx" ON "knowledge_bases"("organizationId");

-- CreateIndex
CREATE INDEX "knowledge_bases_isActive_idx" ON "knowledge_bases"("isActive");

-- CreateIndex
CREATE INDEX "documents_knowledgeBaseId_idx" ON "documents"("knowledgeBaseId");

-- CreateIndex
CREATE INDEX "documents_sourceType_idx" ON "documents"("sourceType");

-- CreateIndex
CREATE INDEX "documents_status_idx" ON "documents"("status");

-- CreateIndex
CREATE INDEX "documents_lastCrawledAt_idx" ON "documents"("lastCrawledAt");

-- CreateIndex
CREATE INDEX "link_rules_organizationId_idx" ON "link_rules"("organizationId");

-- CreateIndex
CREATE INDEX "link_rules_isActive_idx" ON "link_rules"("isActive");

-- CreateIndex
CREATE INDEX "unanswered_messages_organizationId_idx" ON "unanswered_messages"("organizationId");

-- CreateIndex
CREATE INDEX "unanswered_messages_isProcessed_idx" ON "unanswered_messages"("isProcessed");

-- CreateIndex
CREATE INDEX "unanswered_messages_count_idx" ON "unanswered_messages"("count");

-- CreateIndex
CREATE INDEX "unanswered_messages_lastAskedAt_idx" ON "unanswered_messages"("lastAskedAt");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_logs" ADD CONSTRAINT "chat_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_logs" ADD CONSTRAINT "chat_logs_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "widgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_bases" ADD CONSTRAINT "knowledge_bases_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "knowledge_bases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_rules" ADD CONSTRAINT "link_rules_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unanswered_messages" ADD CONSTRAINT "unanswered_messages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
