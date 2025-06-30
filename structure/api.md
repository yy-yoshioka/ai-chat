yusukeyoshioka@Mac src % tree
.
├── app.ts
├── jobs
│   └── embeddingCron.ts
├── lib
│   ├── analytics.ts
│   ├── dataRetention.ts
│   ├── emailTemplates.ts
│   ├── onboardingService.ts
│   ├── prisma.ts
│   ├── sentry.ts
│   ├── stripe.ts
│   ├── usageTracker.ts
│   └── websocket.ts
├── middleware
│   ├── admin.ts
│   ├── auth.ts
│   ├── metrics.ts
│   ├── organizationAccess.ts
│   └── requireValidWidget.ts
├── routes
│   ├── admin.ts
│   ├── analytics.ts
│   ├── auth.ts
│   ├── billing.ts
│   ├── chat.ts
│   ├── companies.ts
│   ├── embed.ts
│   ├── faqs.ts
│   ├── translation.ts
│   ├── widgetLoader.ts
│   └── widgets.ts
├── scripts
│   └── migrate-admin-to-roles.ts
├── server.ts
├── services
│   ├── embeddingWorker.ts
│   ├── faqSuggestionService.ts
│   ├── linkRuleService.ts
│   ├── ragService.ts
│   ├── securityService.ts
│   └── thirdPartyConnectors.ts
└── utils
    ├── jwt.ts
    ├── password.ts
    ├── rateLimiter.ts
    ├── themeUtils.ts
    ├── validateHexColor.ts
    └── widgetKey.ts
