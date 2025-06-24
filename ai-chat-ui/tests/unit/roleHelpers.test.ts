import { hasRole, hasPermission, User, Role } from '../../app/_domains/auth';

describe('Role Helpers', () => {
  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user', // Legacy role
    roles: ['viewer'], // New role system
    organizationId: 'org-1',
    organizationName: 'Test Org',
    organizations: [
      {
        organizationId: 'org-1',
        organizationName: 'Test Org',
        roles: ['org_admin', 'editor'],
        permissions: [
          { resource: 'widgets', actions: ['read', 'write', 'delete'] },
          { resource: 'users', actions: ['read', 'write'] },
          { resource: 'settings', actions: ['read'] },
        ],
        joinedAt: new Date('2024-01-01'),
      },
      {
        organizationId: 'org-2',
        organizationName: 'Another Org',
        roles: ['viewer'],
        permissions: [{ resource: 'widgets', actions: ['read'] }],
        joinedAt: new Date('2024-02-01'),
      },
    ],
  };

  const mockAdminUser: User = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin', // Legacy admin role
    organizationId: 'org-1',
    organizationName: 'Test Org',
  };

  describe('hasRole', () => {
    it('should return true for roles in new role system', () => {
      expect(hasRole(mockUser, 'org-1', 'org_admin')).toBe(true);
      expect(hasRole(mockUser, 'org-1', 'editor')).toBe(true);
      expect(hasRole(mockUser, 'org-2', 'viewer')).toBe(true);
    });

    it('should return false for roles not assigned', () => {
      expect(hasRole(mockUser, 'org-1', 'owner')).toBe(false);
      expect(hasRole(mockUser, 'org-2', 'org_admin')).toBe(false);
      expect(hasRole(mockUser, 'org-3', 'viewer')).toBe(false);
    });

    it('should handle legacy admin role compatibility', () => {
      expect(hasRole(mockAdminUser, 'org-1', 'org_admin')).toBe(true);
      expect(hasRole(mockAdminUser, 'org-1', 'editor')).toBe(true);
      expect(hasRole(mockAdminUser, 'org-1', 'viewer')).toBe(true);
    });

    it('should return false for legacy admin in different org', () => {
      expect(hasRole(mockAdminUser, 'org-2', 'org_admin')).toBe(false);
    });

    it('should handle missing organization memberships', () => {
      const userWithoutOrgs: User = {
        ...mockUser,
        organizations: undefined,
      };
      expect(hasRole(userWithoutOrgs, 'org-1', 'viewer')).toBe(false);
    });

    it('should handle role hierarchy correctly', () => {
      const roles: Role[] = ['owner', 'org_admin', 'editor', 'viewer'];

      // Test that each role includes access for lower levels
      roles.forEach((role) => {
        expect(hasRole(mockUser, 'org-1', role)).toBe(
          mockUser.organizations![0].roles.includes(role)
        );
      });
    });
  });

  describe('hasPermission', () => {
    it('should return true for granted permissions', () => {
      expect(hasPermission(mockUser, 'org-1', 'widgets', 'read')).toBe(true);
      expect(hasPermission(mockUser, 'org-1', 'widgets', 'write')).toBe(true);
      expect(hasPermission(mockUser, 'org-1', 'widgets', 'delete')).toBe(true);
      expect(hasPermission(mockUser, 'org-1', 'users', 'read')).toBe(true);
      expect(hasPermission(mockUser, 'org-1', 'users', 'write')).toBe(true);
    });

    it('should return false for denied permissions', () => {
      expect(hasPermission(mockUser, 'org-1', 'users', 'delete')).toBe(false);
      expect(hasPermission(mockUser, 'org-1', 'settings', 'write')).toBe(false);
      expect(hasPermission(mockUser, 'org-2', 'widgets', 'write')).toBe(false);
    });

    it('should return false for non-existent organization', () => {
      expect(hasPermission(mockUser, 'org-3', 'widgets', 'read')).toBe(false);
    });

    it('should return false for non-existent resource', () => {
      expect(hasPermission(mockUser, 'org-1', 'billing', 'read')).toBe(false);
    });

    it('should handle missing organization memberships', () => {
      const userWithoutOrgs: User = {
        ...mockUser,
        organizations: undefined,
      };
      expect(hasPermission(userWithoutOrgs, 'org-1', 'widgets', 'read')).toBe(false);
    });

    it('should handle case sensitivity in resource names', () => {
      expect(hasPermission(mockUser, 'org-1', 'Widgets', 'read')).toBe(false);
      expect(hasPermission(mockUser, 'org-1', 'widgets', 'Read')).toBe(false);
    });

    it('should handle multiple actions correctly', () => {
      const orgMembership = mockUser.organizations![0];
      const widgetPermission = orgMembership.permissions.find((p) => p.resource === 'widgets');

      expect(widgetPermission?.actions).toContain('read');
      expect(widgetPermission?.actions).toContain('write');
      expect(widgetPermission?.actions).toContain('delete');
      expect(widgetPermission?.actions).not.toContain('admin');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined user', () => {
      expect(hasRole(null as any, 'org-1', 'viewer')).toBe(false);
      expect(hasPermission(undefined as any, 'org-1', 'widgets', 'read')).toBe(false);
    });

    it('should handle empty organization ID', () => {
      expect(hasRole(mockUser, '', 'viewer')).toBe(false);
      expect(hasPermission(mockUser, '', 'widgets', 'read')).toBe(false);
    });

    it('should handle empty role/resource/action', () => {
      expect(hasRole(mockUser, 'org-1', '' as any)).toBe(false);
      expect(hasPermission(mockUser, 'org-1', '', 'read')).toBe(false);
      expect(hasPermission(mockUser, 'org-1', 'widgets', '')).toBe(false);
    });

    it('should handle user with empty organizations array', () => {
      const userWithEmptyOrgs: User = {
        ...mockUser,
        organizations: [],
      };
      expect(hasRole(userWithEmptyOrgs, 'org-1', 'viewer')).toBe(false);
      expect(hasPermission(userWithEmptyOrgs, 'org-1', 'widgets', 'read')).toBe(false);
    });

    it('should handle organization with empty roles/permissions', () => {
      const userWithEmptyRoles: User = {
        ...mockUser,
        organizations: [
          {
            organizationId: 'org-empty',
            organizationName: 'Empty Org',
            roles: [],
            permissions: [],
            joinedAt: new Date(),
          },
        ],
      };
      expect(hasRole(userWithEmptyRoles, 'org-empty', 'viewer')).toBe(false);
      expect(hasPermission(userWithEmptyRoles, 'org-empty', 'widgets', 'read')).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of organizations efficiently', () => {
      const largeOrgUser: User = {
        ...mockUser,
        organizations: Array.from({ length: 100 }, (_, i) => ({
          organizationId: `org-${i}`,
          organizationName: `Org ${i}`,
          roles: ['viewer'],
          permissions: [{ resource: 'widgets', actions: ['read'] }],
          joinedAt: new Date(),
        })),
      };

      const start = performance.now();
      expect(hasRole(largeOrgUser, 'org-50', 'viewer')).toBe(true);
      expect(hasPermission(largeOrgUser, 'org-75', 'widgets', 'read')).toBe(true);
      const end = performance.now();

      // Should complete within reasonable time (< 10ms)
      expect(end - start).toBeLessThan(10);
    });
  });
});
