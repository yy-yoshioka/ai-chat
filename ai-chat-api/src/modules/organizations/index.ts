import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import organizationRoutes from './routes';

const organizationsModule: ModuleDefinition = {
  name: 'organizations',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Organizations module initialized');
  },

  routes(app: Express) {
    app.use('/api/organizations', organizationRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Organizations module cleaned up');
  },
};

export default organizationsModule;
