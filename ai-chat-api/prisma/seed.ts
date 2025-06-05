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

    // Generate proper widget keys
    const widgetKey1 =
      'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
    const widgetKey2 =
      'f6e5d4c3b2a1098765432109876543210987654321fedcba0987654321fedcba';
    const legacyWidgetKey = 'test-widget-key-1'; // Legacy format for backwards compatibility

    // Create two dummy widgets with proper widget keys
    const widget1 = await prisma.widget.upsert({
      where: { widgetKey: widgetKey1 },
      update: {},
      create: {
        widgetKey: widgetKey1,
        name: 'Main Website Chat',
        companyId: company.id,
        isActive: true,
        accentColor: '#007bff',
        logoUrl: null,
      },
    });

    const widget2 = await prisma.widget.upsert({
      where: { widgetKey: widgetKey2 },
      update: {},
      create: {
        widgetKey: widgetKey2,
        name: 'Support Portal Chat',
        companyId: company.id,
        isActive: true,
        accentColor: '#28a745',
        logoUrl: null,
      },
    });

    // Create legacy widget for backwards compatibility
    const legacyWidget = await prisma.widget.upsert({
      where: { widgetKey: legacyWidgetKey },
      update: {},
      create: {
        widgetKey: legacyWidgetKey,
        name: 'Legacy Chat Widget',
        companyId: company.id,
        isActive: true,
        accentColor: '#6c757d',
        logoUrl: null,
      },
    });

    console.log('✅ Created widgets:');
    console.log('  - Widget 1:', widget1.name, 'Key:', widget1.widgetKey);
    console.log('  - Widget 2:', widget2.name, 'Key:', widget2.widgetKey);
    console.log(
      '  - Legacy Widget:',
      legacyWidget.name,
      'Key:',
      legacyWidget.widgetKey
    );

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
