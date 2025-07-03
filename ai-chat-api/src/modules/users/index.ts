import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const usersModule: ModuleDefinition = {
  name: 'users',

  async initialize(app: Express) {
    console.log('Users module initialized');
  },

  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/users', routes);
    } catch (error) {
      console.warn('No routes found for users module');
    }
  },

  async cleanup() {
    console.log('Users module cleaned up');
  },
};

export default usersModule;
