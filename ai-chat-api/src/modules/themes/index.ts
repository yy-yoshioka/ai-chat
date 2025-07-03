import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';

const themesModule: ModuleDefinition = {
  name: 'themes',

  async initialize(app: Express) {
    console.log('Themes module initialized');
  },

  routes(app: Express) {
    try {
      const routes = require('./routes').default;
      app.use('/api/themes', routes);
    } catch (error) {
      console.warn('No routes found for themes module');
    }
  },

  async cleanup() {
    console.log('Themes module cleaned up');
  },
};

export default themesModule;
