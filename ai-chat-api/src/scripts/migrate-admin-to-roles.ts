import { prisma } from '../lib/prisma';

async function migrateAdminToRoles() {
  console.log('Starting admin to roles migration...');

  try {
    // Find all users who are currently admins
    const adminUsers = await prisma.user.findMany({
      where: {
        isAdmin: true,
      },
    });

    console.log(`Found ${adminUsers.length} admin users to migrate`);

    // Update each admin user to have org_admin role
    for (const user of adminUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: ['org_admin'], // Convert legacy admin to org_admin
        },
      });
      console.log(`Migrated user ${user.email} to org_admin role`);
    }

    // Find all users who are not admins and assign viewer role
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        isAdmin: false,
        roles: {
          isEmpty: true,
        },
      },
    });

    console.log(
      `Found ${nonAdminUsers.length} non-admin users to assign viewer role`
    );

    for (const user of nonAdminUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roles: ['viewer'],
        },
      });
      console.log(`Assigned viewer role to user ${user.email}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if called directly
if (require.main === module) {
  migrateAdminToRoles();
}

export { migrateAdminToRoles };
