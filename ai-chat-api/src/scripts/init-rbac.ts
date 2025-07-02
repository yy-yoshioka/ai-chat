import { initializeRolePermissions } from '../services/rbacService';
import { logger } from '../lib/logger';

async function main() {
  try {
    console.log('Initializing RBAC permissions...');
    await initializeRolePermissions();
    console.log('RBAC permissions initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RBAC permissions:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main().catch(console.error);
