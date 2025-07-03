import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import billingRoutes from './routes';

const billingModule: ModuleDefinition = {
  name: 'billing',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Billing module initialized');
  },

  routes(app: Express) {
    app.use('/api/billing', billingRoutes);

    // Webhook route is special and needs to be registered at root level
    // This will be handled separately in the main app initialization
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Billing module cleaned up');
  },
};

export default billingModule;
