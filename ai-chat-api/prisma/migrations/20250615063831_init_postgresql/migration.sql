-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('free', 'pro', 'enterprise');

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
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
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

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
