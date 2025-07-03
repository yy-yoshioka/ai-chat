import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import authRoutes from './routes';

const authModule: ModuleDefinition = {
  name: 'auth',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Auth module initialized');
  },

  routes(app: Express) {
    app.use('/api/auth', authRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Auth module cleaned up');
  },
};

export default authModule;
