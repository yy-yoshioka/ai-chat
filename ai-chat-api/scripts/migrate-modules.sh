#!/bin/bash

# Function to update imports in a file
update_imports() {
  local file=$1
  
  # Update relative imports to use path aliases
  sed -i '' "s|from '\.\./middleware/|from '../../middleware/|g" "$file"
  sed -i '' "s|from '\.\./lib/prisma'|from '@shared/database/prisma'|g" "$file"
  sed -i '' "s|from '\.\./lib/logger'|from '@shared/logger'|g" "$file"
  sed -i '' "s|from '\.\./lib/stripe'|from '@shared/payment/stripe'|g" "$file"
  sed -i '' "s|from '\.\./utils/|from '@shared/utils/|g" "$file"
  sed -i '' "s|from '\.\./services/|from './services/|g" "$file"
  
  # Update cross-module imports
  sed -i '' "s|from '\.\./services/webhookService'|from '../../webhooks/services/webhookService'|g" "$file"
  sed -i '' "s|from '\.\./services/customResponseService'|from '../../custom-responses/services/customResponseService'|g" "$file"
  sed -i '' "s|from '\.\./services/organizationManagementService'|from '../../organizations/services/organizationManagementService'|g" "$file"
  sed -i '' "s|from '\.\./services/widgetService'|from '../../widgets/services/widgetService'|g" "$file"
}

# Function to create module index file
create_module_index() {
  local module=$1
  local displayName=$2
  
  cat > "src/modules/$module/index.ts" << EOF
import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import ${module}Routes from './routes';

const ${module}Module: ModuleDefinition = {
  name: '$module',
  
  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('$displayName module initialized');
  },
  
  routes(app: Express) {
    app.use('/api/$module', ${module}Routes);
  },
  
  async cleanup() {
    // Cleanup resources if needed
    console.log('$displayName module cleaned up');
  }
};

export default ${module}Module;
EOF
}

# Migrate widgets module
echo "Migrating widgets module..."
update_imports "src/modules/widgets/routes.ts"
update_imports "src/modules/widgets/services/widgetService.ts"
create_module_index "widgets" "Widgets"

# Migrate chat module
echo "Migrating chat module..."
if [ -f "src/routes/chat.ts" ]; then
  cp src/routes/chat.ts src/modules/chat/routes.ts
  update_imports "src/modules/chat/routes.ts"
fi
# Find and copy chat-related services
for service in src/services/*chat*.ts src/services/*ai*.ts src/services/*rag*.ts; do
  if [ -f "$service" ]; then
    filename=$(basename "$service")
    cp "$service" "src/modules/chat/services/$filename"
    update_imports "src/modules/chat/services/$filename"
  fi
done
create_module_index "chat" "Chat"

# Migrate FAQs module
echo "Migrating FAQs module..."
if [ -f "src/routes/faqs.ts" ]; then
  cp src/routes/faqs.ts src/modules/faqs/routes.ts
  update_imports "src/modules/faqs/routes.ts"
fi
if [ -f "src/services/faqSuggestionService.ts" ]; then
  cp src/services/faqSuggestionService.ts src/modules/faqs/services/
  update_imports "src/modules/faqs/services/faqSuggestionService.ts"
fi
create_module_index "faqs" "FAQs"

# Migrate knowledge-base module
echo "Migrating knowledge-base module..."
if [ -f "src/routes/knowledge-base.ts" ]; then
  cp src/routes/knowledge-base.ts src/modules/knowledge-base/routes.ts
  update_imports "src/modules/knowledge-base/routes.ts"
fi
for service in src/services/*knowledge*.ts src/services/*embedding*.ts src/services/*document*.ts; do
  if [ -f "$service" ]; then
    filename=$(basename "$service")
    cp "$service" "src/modules/knowledge-base/services/$filename"
    update_imports "src/modules/knowledge-base/services/$filename"
  fi
done
create_module_index "knowledge-base" "Knowledge Base"

# Migrate webhooks module
echo "Migrating webhooks module..."
if [ -f "src/routes/webhooks.ts" ]; then
  cp src/routes/webhooks.ts src/modules/webhooks/routes.ts
  update_imports "src/modules/webhooks/routes.ts"
fi
if [ -f "src/services/webhookService.ts" ]; then
  cp src/services/webhookService.ts src/modules/webhooks/services/
  update_imports "src/modules/webhooks/services/webhookService.ts"
fi
create_module_index "webhooks" "Webhooks"

# Migrate custom-responses module
echo "Migrating custom-responses module..."
if [ -f "src/routes/customResponses.ts" ]; then
  cp src/routes/customResponses.ts src/modules/custom-responses/routes.ts
  update_imports "src/modules/custom-responses/routes.ts"
fi
if [ -f "src/services/customResponseService.ts" ]; then
  cp src/services/customResponseService.ts src/modules/custom-responses/services/
  update_imports "src/modules/custom-responses/services/customResponseService.ts"
fi
create_module_index "custom-responses" "Custom Responses"

echo "Module migration script completed!"