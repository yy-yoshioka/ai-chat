#!/bin/bash

echo "Fixing imports across all modules..."

# Fix imports in all module files
find src/modules -name "*.ts" -type f | while read file; do
  echo "Fixing imports in: $file"
  
  # Update middleware imports
  sed -i '' "s|from '\.\./middleware/|from '../../middleware/|g" "$file"
  sed -i '' "s|from '\.\./\.\./middleware/|from '../../middleware/|g" "$file"
  
  # Update lib imports to shared
  sed -i '' "s|from '\.\./lib/prisma'|from '@shared/database/prisma'|g" "$file"
  sed -i '' "s|from '\.\./lib/logger'|from '@shared/logger'|g" "$file"
  sed -i '' "s|from '\.\./lib/stripe'|from '@shared/payment/stripe'|g" "$file"
  sed -i '' "s|from '\.\./lib/analytics'|from '@shared/analytics'|g" "$file"
  sed -i '' "s|from '\.\./lib/emailTemplates'|from '@shared/email/templates'|g" "$file"
  sed -i '' "s|from '\.\./lib/encryption'|from '@shared/security/encryption'|g" "$file"
  sed -i '' "s|from '\.\./lib/dataRetention'|from '@shared/security/dataRetention'|g" "$file"
  sed -i '' "s|from '\.\./lib/sentry'|from '@shared/config/sentry'|g" "$file"
  sed -i '' "s|from '\.\./lib/websocket'|from '@shared/websocket'|g" "$file"
  sed -i '' "s|from '\.\./lib/onboardingService'|from '@shared/utils/onboardingService'|g" "$file"
  sed -i '' "s|from '\.\./lib/telemetry'|from '@shared/analytics/telemetry'|g" "$file"
  sed -i '' "s|from '\.\./lib/usageTracker'|from '@shared/analytics/usageTracker'|g" "$file"
  
  # Update utils imports
  sed -i '' "s|from '\.\./utils/|from '@shared/utils/|g" "$file"
  
  # Update cross-module service imports
  sed -i '' "s|from '\.\./services/webhookService'|from '../../webhooks/services/webhookService'|g" "$file"
  sed -i '' "s|from '\.\./services/customResponseService'|from '../../custom-responses/services/customResponseService'|g" "$file"
  sed -i '' "s|from '\.\./services/organizationManagementService'|from '../../organizations/services/organizationManagementService'|g" "$file"
  sed -i '' "s|from '\.\./services/widgetService'|from '../../widgets/services/widgetService'|g" "$file"
  sed -i '' "s|from '\.\./services/billingService'|from '../../billing/services/billingService'|g" "$file"
  sed -i '' "s|from '\.\./services/userManagementService'|from '../../users/services/userManagementService'|g" "$file"
  sed -i '' "s|from '\.\./services/securityService'|from '../../security/services/securityService'|g" "$file"
  sed -i '' "s|from '\.\./services/dataRetentionService'|from '../../security/services/dataRetentionService'|g" "$file"
  sed -i '' "s|from '\.\./services/knowledgeBaseService'|from '../../knowledge-base/services/knowledgeBaseService'|g" "$file"
  sed -i '' "s|from '\.\./services/embeddingWorker'|from '../../knowledge-base/services/embeddingWorker'|g" "$file"
  sed -i '' "s|from '\.\./services/documentProcessor'|from '../../knowledge-base/services/documentProcessor'|g" "$file"
  sed -i '' "s|from '\.\./services/reportService'|from '../../analytics/services/reportService'|g" "$file"
  sed -i '' "s|from '\.\./services/themeService'|from '../../themes/services/themeService'|g" "$file"
  sed -i '' "s|from '\.\./services/healthMonitorService'|from '../../status/services/healthMonitorService'|g" "$file"
  sed -i '' "s|from '\.\./services/faqSuggestionService'|from '../../faqs/services/faqSuggestionService'|g" "$file"
  sed -i '' "s|from '\.\./services/ragService'|from '../../chat/services/ragService'|g" "$file"
  sed -i '' "s|from '\.\./services/aiService'|from '../../chat/services/aiService'|g" "$file"
  sed -i '' "s|from '\.\./services/chatService'|from '../../chat/services/chatService'|g" "$file"
done

# Fix imports in shared files
find src/shared -name "*.ts" -type f | while read file; do
  echo "Fixing imports in: $file"
  
  # Fix relative imports within shared
  sed -i '' "s|from '\./prisma'|from '@shared/database/prisma'|g" "$file"
  sed -i '' "s|from '\./logger'|from '@shared/logger'|g" "$file"
  sed -i '' "s|from '\./stripe'|from '@shared/payment/stripe'|g" "$file"
  sed -i '' "s|from '\./emailTemplates'|from '@shared/email/templates'|g" "$file"
  
  # Fix relative imports from parent directories
  sed -i '' "s|from '\.\./lib/prisma'|from '@shared/database/prisma'|g" "$file"
  sed -i '' "s|from '\.\./lib/logger'|from '@shared/logger'|g" "$file"
  sed -i '' "s|from '\.\./lib/stripe'|from '@shared/payment/stripe'|g" "$file"
done

echo "Import fixes completed!"