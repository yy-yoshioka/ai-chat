import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import chatRoutes from './routes';

const chatModule: ModuleDefinition = {
  name: 'chat',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Chat module initialized');
  },

  routes(app: Express) {
    app.use('/api/chat', chatRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Chat module cleaned up');
  },
};

export default chatModule;
