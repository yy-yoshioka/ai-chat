import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import webhooksRoutes from './routes';

const webhooksModule: ModuleDefinition = {
  name: 'webhooks',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Webhooks module initialized');
  },

  routes(app: Express) {
    app.use('/api/webhooks', webhooksRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Webhooks module cleaned up');
  },
};

export default webhooksModule;
