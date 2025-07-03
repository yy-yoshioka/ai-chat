import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import customResponsesRoutes from './routes';

const customResponsesModule: ModuleDefinition = {
  name: 'custom-responses',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Custom Responses module initialized');
  },

  routes(app: Express) {
    app.use('/api/custom-responses', customResponsesRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Custom Responses module cleaned up');
  },
};

export default customResponsesModule;
