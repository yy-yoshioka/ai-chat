import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import knowledgeBaseRoutes from './routes';

const knowledgeBaseModule: ModuleDefinition = {
  name: 'knowledge-base',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('Knowledge Base module initialized');
  },

  routes(app: Express) {
    app.use('/api/knowledge-base', knowledgeBaseRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('Knowledge Base module cleaned up');
  },
};

export default knowledgeBaseModule;
