import dotenv from 'dotenv';
import { prisma } from '../lib/prisma';
import { createApiCredentials } from '../services/apiCredentialsService';

// Load environment variables
dotenv.config();

/**
 * Migration script to move API credentials from environment variables to encrypted storage
 * Run this script once for each organization that needs to migrate
 */
async function migrateApiCredentials() {
  console.log('Starting API credentials migration...');

  // Get the organization ID from command line argument
  const organizationId = process.argv[2];
  if (!organizationId) {
    console.error(
      'Usage: yarn ts-node src/scripts/migrateApiCredentials.ts <organizationId>'
    );
    process.exit(1);
  }

  // Verify organization exists
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    console.error(`Organization not found: ${organizationId}`);
    process.exit(1);
  }

  console.log(`Migrating credentials for organization: ${organization.name}`);

  // Get the first admin user for the organization (for audit logging)
  const adminUser = await prisma.user.findFirst({
    where: {
      organizationId,
      roles: {
        has: 'owner',
      },
    },
  });

  if (!adminUser) {
    console.error('No admin user found for organization');
    process.exit(1);
  }

  const credentialsToMigrate = [];

  // OpenAI API Key
  if (
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  ) {
    credentialsToMigrate.push({
      service: 'openai',
      name: 'Default',
      credentials: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini-2024-07-18',
      },
    });
  }

  // Stripe API Keys
  if (
    process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_development')
  ) {
    credentialsToMigrate.push({
      service: 'stripe',
      name: 'Default',
      credentials: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    });
  }

  // SMTP Configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    credentialsToMigrate.push({
      service: 'smtp',
      name: 'Default',
      credentials: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Migrate each credential
  for (const cred of credentialsToMigrate) {
    try {
      // Check if already exists
      const existing = await prisma.apiCredentials.findFirst({
        where: {
          organizationId,
          service: cred.service,
          name: cred.name,
        },
      });

      if (existing) {
        console.log(`Skipping ${cred.service}:${cred.name} - already exists`);
        continue;
      }

      await createApiCredentials(
        {
          organizationId,
          service: cred.service,
          name: cred.name,
          credentials: cred.credentials,
        },
        adminUser.id
      );

      console.log(`✓ Migrated ${cred.service}:${cred.name}`);
    } catch (error) {
      console.error(`✗ Failed to migrate ${cred.service}:${cred.name}:`, error);
    }
  }

  console.log('\nMigration complete!');
  console.log(
    '\nIMPORTANT: After verifying that the migrated credentials work correctly:'
  );
  console.log('1. Remove the API keys from your .env file');
  console.log(
    '2. Update your deployment to not include these sensitive values'
  );
  console.log('3. Rotate the API keys for additional security');
}

// Run the migration
migrateApiCredentials()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
