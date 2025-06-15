export interface TestUser {
  email: string;
  password: string;
  organizationName: string;
}

export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!',
    organizationName: `Test Org ${timestamp}`,
  };
}

export const defaultTestUser: TestUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  organizationName: 'Test Organization',
};
