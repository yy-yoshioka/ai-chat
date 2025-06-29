import type { UserProfile, ActivityStats } from '@/app/_schemas/profile';

export const mockUserProfile: UserProfile = {
  id: 'user-123456',
  email: 'test.user@example.com',
  name: 'Test User',
  isAdmin: false,
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
};

export const mockAdminProfile: UserProfile = {
  id: 'admin-789012',
  email: 'admin@example.com',
  name: 'Admin User',
  isAdmin: true,
  createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
};

export const mockActivityStats: ActivityStats = {
  totalMessages: 1234,
  totalChats: 89,
  lastActiveDate: new Date().toISOString(),
  daysActive: 90,
};

export function createMockUserProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    ...mockUserProfile,
    ...overrides,
  };
}
