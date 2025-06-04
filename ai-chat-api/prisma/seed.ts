import { PrismaClient, PlanType } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function generateWidgetKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  try {
    console.log('🌱 Starting seed...');

    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password:
          '$2b$10$rOGmzKV1U6oiKthsO4LgQ.EXqKTGf/PjRmV8LPG/QNAjNJPq.3C9S', // password: "test123"
        name: 'Test User',
        isAdmin: true,
      },
    });

    console.log('✅ Created user:', user.email);

    // Create a dummy company with specific ID
    const company = await prisma.company.upsert({
      where: { id: 'test-company-id' },
      update: {},
      create: {
        id: 'test-company-id',
        name: 'Test Company',
        email: 'test@example.com',
        plan: PlanType.pro,
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
