import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import widgetsRoutes from './routes';

const widgetsModule: ModuleDefinition = {
  name: 'widgets',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Widgets module initialized');
  },

  routes(app: Express) {
    app.use('/api/widgets', widgetsRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Widgets module cleaned up');
  },
};

export default widgetsModule;
