import { Express } from 'express';
import { ModuleDefinition } from '@shared/moduleLoader';
import faqsRoutes from './routes';

const faqsModule: ModuleDefinition = {
  name: 'faqs',

  async initialize(app: Express) {
    // Module-specific initialization if needed
    console.log('FAQs module initialized');
  },

  routes(app: Express) {
    app.use('/api/faqs', faqsRoutes);
  },

  async cleanup() {
    // Cleanup resources if needed
    console.log('FAQs module cleaned up');
  },
};

export default faqsModule;
