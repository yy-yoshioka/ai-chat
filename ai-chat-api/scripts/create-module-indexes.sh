#!/bin/bash

# Function to create a simple module index
create_module_index() {
  local module=$1
  local displayName=$2
  
  cat > "src/modules/$module/index.ts" << EOF
import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const ${module}Module: ModuleDefinition = {
  name: '$module',
  
  async initialize(app: Express) {
    console.log('$displayName module initialized');
  },
  
  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/$module', routes);
    } catch (error) {
      console.warn('No routes found for $module module');
    }
  },
  
  async cleanup() {
    console.log('$displayName module cleaned up');
  }
};

export default ${module}Module;
EOF
}

# Create indexes for remaining modules
create_module_index "users" "Users"
create_module_index "security" "Security"
create_module_index "analytics" "Analytics"
create_module_index "status" "Status"
create_module_index "themes" "Themes"

echo "Module indexes created!"