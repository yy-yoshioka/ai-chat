import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const statusModule: ModuleDefinition = {
  name: 'status',

  async initialize(app: Express) {
    console.log('Status module initialized');
  },

  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/status', routes);
    } catch (error) {
      console.warn('No routes found for status module');
    }
  },

  async cleanup() {
    console.log('Status module cleaned up');
  },
};

export default statusModule;
