# Backend Vertical Slice Architecture Migration Plan

## Overview

This document outlines the migration plan for refactoring the backend from a traditional layered architecture to a vertical slice architecture that mirrors the frontend structure.

## Goals

- Organize code by features/domains instead of technical layers
- Improve module isolation and maintainability
- Enable better code ownership and team scalability
- Implement automatic module loading
- Maintain backward compatibility during migration

## New Directory Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   ├── services/
│   │   ├── controllers/
│   │   └── types.ts
│   ├── billing/
│   ├── organizations/
│   ├── widgets/
│   ├── chat/
│   ├── faqs/
│   ├── knowledge-base/
│   ├── webhooks/
│   ├── users/
│   ├── security/
│   ├── analytics/
│   ├── status/
│   ├── themes/
│   └── custom-responses/
├── shared/
│   ├── database/
│   ├── cache/
│   ├── logger/
│   ├── config/
│   ├── utils/
│   └── types/
├── middlewares/
│   ├── auth.ts
│   ├── security.ts
│   ├── validateRequest.ts
│   └── errorHandler.ts
├── jobs/
│   ├── billing/
│   ├── data-retention/
│   └── analytics/
└── scripts/
    ├── migrate.ts
    └── seed.ts
```

## Migration Phases

### Phase 1: Foundation Setup ✅

- [x] Configure TypeScript path aliases
- [x] Install and configure eslint-plugin-boundaries
- [x] Create new directory structure
- [x] Create automatic module loader

### Phase 2: Migrate Shared Utilities

- [ ] Move lib/prisma.ts → shared/database/prisma.ts
- [ ] Move lib/logger.ts → shared/logger/index.ts
- [ ] Move lib/redis.ts → shared/cache/redis.ts
- [ ] Move lib/s3.ts → shared/storage/s3.ts
- [ ] Move lib/email.ts → shared/email/index.ts
- [ ] Move lib/openai.ts → shared/ai/openai.ts
- [ ] Move lib/stripe.ts → shared/payment/stripe.ts
- [ ] Move lib/vectorDb.ts → shared/database/vectorDb.ts
- [ ] Move utils/_ → shared/utils/_
- [ ] Create backward compatibility exports in lib/\*

### Phase 3: Migrate Modules

For each module:

1. Create module directory structure
2. Move related routes, services, and controllers
3. Create module index.ts with ModuleDefinition
4. Update imports to use new paths
5. Test module in isolation

#### Module Migration Order:

1. **auth** - Authentication and authorization
   - routes/auth.ts → modules/auth/routes.ts
   - services/authService.ts → modules/auth/services/authService.ts
   - middleware/auth.ts → Keep in middlewares/auth.ts (shared)

2. **billing** - Subscription and payment management
   - routes/billing.ts → modules/billing/routes.ts
   - services/billingService.ts → modules/billing/services/billingService.ts
   - services/subscriptionService.ts → modules/billing/services/subscriptionService.ts

3. **organizations** - Organization management
   - routes/organizations.ts → modules/organizations/routes.ts
   - services/organizationManagementService.ts → modules/organizations/services/
   - services/organizationAccessService.ts → modules/organizations/services/

4. **widgets** - Widget management
   - routes/widgets.ts → modules/widgets/routes.ts
   - services/widgetService.ts → modules/widgets/services/widgetService.ts

5. **chat** - Chat functionality
   - routes/chat.ts → modules/chat/routes.ts
   - services/chatService.ts → modules/chat/services/chatService.ts
   - services/aiService.ts → modules/chat/services/aiService.ts

6. **faqs** - FAQ management
   - routes/faqs.ts → modules/faqs/routes.ts
   - services/faqService.ts → modules/faqs/services/faqService.ts

7. **knowledge-base** - Knowledge base management
   - routes/knowledgeBase.ts → modules/knowledge-base/routes.ts
   - services/knowledgeBaseService.ts → modules/knowledge-base/services/
   - services/embeddingWorker.ts → modules/knowledge-base/services/
   - services/documentProcessor.ts → modules/knowledge-base/services/

8. **webhooks** - Webhook management
   - routes/webhooks.ts → modules/webhooks/routes.ts
   - services/webhookService.ts → modules/webhooks/services/

9. **users** - User management
   - routes/users.ts → modules/users/routes.ts
   - services/userService.ts → modules/users/services/

10. **security** - Security features
    - routes/security.ts → modules/security/routes.ts
    - services/securityService.ts → modules/security/services/
    - services/dataRetentionService.ts → modules/security/services/

11. **analytics** - Analytics and reporting
    - routes/analytics.ts → modules/analytics/routes.ts
    - services/analyticsService.ts → modules/analytics/services/

12. **status** - System status and health
    - routes/status.ts → modules/status/routes.ts
    - services/telemetry.ts → modules/status/services/

13. **themes** - Theme management
    - routes/themes.ts → modules/themes/routes.ts
    - Theme-related logic from widgetService.ts → modules/themes/services/

14. **custom-responses** - Custom response management
    - routes/customResponses.ts → modules/custom-responses/routes.ts
    - services/customResponseService.ts → modules/custom-responses/services/

### Phase 4: Migrate Jobs

- [ ] Move billing-related jobs → jobs/billing/
- [ ] Move data retention jobs → jobs/data-retention/
- [ ] Move analytics jobs → jobs/analytics/
- [ ] Update job scheduling to use new paths

### Phase 5: Cleanup

- [ ] Remove backward compatibility exports
- [ ] Delete old directory structure
- [ ] Update all imports
- [ ] Update tests
- [ ] Update documentation

### Phase 6: Verification

- [ ] Run `yarn lint` - should pass with no errors
- [ ] Run `yarn tsc` - should compile with no errors
- [ ] Run all tests
- [ ] Verify module boundaries are enforced

## Module Template

Each module should follow this structure:

```typescript
// modules/<module-name>/index.ts
import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import { registerRoutes } from './routes';

const module: ModuleDefinition = {
  name: 'module-name',

  async initialize(app: Express) {
    // Module-specific initialization
    // e.g., database connections, external services
  },

  routes(app: Express) {
    registerRoutes(app);
  },

  async cleanup() {
    // Cleanup resources if needed
  },
};

export default module;
```

## Backward Compatibility Strategy

During migration, maintain backward compatibility by creating re-exports:

```typescript
// lib/prisma.ts (temporary during migration)
export * from '../shared/database/prisma';
```

This allows existing code to continue working while we gradually update imports.

## Success Criteria

- All modules are isolated and can be developed/tested independently
- Module boundaries are enforced by ESLint
- No circular dependencies between modules
- All tests pass
- TypeScript compilation succeeds
- Linting passes with no errors
- Module loading is automatic and dynamic
