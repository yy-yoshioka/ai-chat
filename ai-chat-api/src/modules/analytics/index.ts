import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const analyticsModule: ModuleDefinition = {
  name: 'analytics',

  async initialize(app: Express) {
    console.log('Analytics module initialized');
  },

  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/analytics', routes);
    } catch (error) {
      console.warn('No routes found for analytics module');
    }
  },

  async cleanup() {
    console.log('Analytics module cleaned up');
  },
};

export default analyticsModule;
