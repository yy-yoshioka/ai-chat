'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, '__esModule', { value: true });
const client_1 = require('@prisma/client');
const crypto = __importStar(require('crypto'));
const prisma = new client_1.PrismaClient();
function generateWidgetKey() {
  return crypto.randomBytes(32).toString('hex');
}
async function main() {
  try {
    console.log('🌱 Starting seed...');
    // Create a dummy company
    const company = await prisma.company.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test Company',
        email: 'test@example.com',
        plan: client_1.PlanType.pro,
      },
    });
    console.log('✅ Created company:', company.name);
    // Create two dummy widgets
    const widget1 = await prisma.widget.upsert({
      where: { widgetKey: 'test-widget-key-1' },
      update: {},
      create: {
        widgetKey: 'test-widget-key-1',
        name: 'Main Website Chat',
        companyId: company.id,
        isActive: true,
        accentColor: '#007bff',
        logoUrl: null,
      },
    });
    const widget2 = await prisma.widget.upsert({
      where: { widgetKey: 'test-widget-key-2' },
      update: {},
      create: {
        widgetKey: 'test-widget-key-2',
        name: 'Support Portal Chat',
        companyId: company.id,
        isActive: true,
        accentColor: '#28a745',
        logoUrl: null,
      },
    });
    console.log('✅ Created widgets:', widget1.name, '&', widget2.name);
    // Create some FAQs for testing
    await prisma.fAQ.upsert({
      where: { id: 'faq-1' },
      update: {},
      create: {
        id: 'faq-1',
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 6 PM EST.',
      },
    });
    await prisma.fAQ.upsert({
      where: { id: 'faq-2' },
      update: {},
      create: {
        id: 'faq-2',
        question: 'How can I contact support?',
        answer:
          'You can contact our support team via email at support@example.com or through this chat widget.',
      },
    });
    console.log('✅ Created sample FAQs');
    console.log('🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}
main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
