import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const securityModule: ModuleDefinition = {
  name: 'security',

  async initialize(app: Express) {
    console.log('Security module initialized');
  },

  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/security', routes);
    } catch (error) {
      console.warn('No routes found for security module');
    }
  },

  async cleanup() {
    console.log('Security module cleaned up');
  },
};

export default securityModule;
