import request from 'supertest';
import express from 'express';
import { prisma } from '../../src/lib/prisma';
import usersRouter from '../../src/routes/users';
import { authMiddleware } from '../../src/middleware/auth';
import { adminMiddleware } from '../../src/middleware/admin';
import { requireOrganizationAccess } from '../../src/middleware/organizationAccess';
import {
  testUser,
  testOrganization,
  generateTestToken,
} from '../fixtures/test-data';
import { Role } from '@prisma/client';
import { webhookService } from '../../src/services/webhookService';
import { hashPassword } from '../../src/utils/password';

// Mock dependencies
jest.mock('../../src/lib/prisma');
jest.mock('../../src/middleware/auth');
jest.mock('../../src/middleware/admin');
jest.mock('../../src/middleware/organizationAccess');
jest.mock('../../src/services/webhookService');
jest.mock('../../src/utils/password');
jest.mock('crypto');

// Mock crypto for consistent invite tokens
const mockCrypto = require('crypto');
mockCrypto.randomBytes = jest.fn().mockReturnValue({
  toString: jest.fn().mockReturnValue('mock-invite-token-12345'),
});

describe('Users Routes', () => {
  let app: express.Application;

  const adminUser = {
    ...testUser,
    id: 'admin-user-id',
    roles: [Role.org_admin],
  };

  const memberUser = {
    id: 'member-user-id',
    name: 'Member User',
    email: 'member@example.com',
    roles: [Role.editor],
    organizationId: testOrganization.id,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  };

  const guestUser = {
    id: 'guest-user-id',
    name: 'Guest User',
    email: 'guest@example.com',
    roles: [Role.viewer],
    organizationId: testOrganization.id,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/users', usersRouter);

    // Setup middleware mocks
    (authMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { ...adminUser, organization: testOrganization };
      next();
    });

    (adminMiddleware as jest.Mock).mockImplementation((req, res, next) => {
      next();
    });

    (requireOrganizationAccess as jest.Mock).mockImplementation(
      (req, res, next) => {
        next();
      }
    );

    (hashPassword as jest.Mock).mockResolvedValue('hashed-password');

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return paginated list of users in organization', async () => {
      const mockUsers = [adminUser, memberUser, guestUser];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);
      (prisma.user.count as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        users: [
          {
            id: adminUser.id,
            name: adminUser.name,
            email: adminUser.email,
            role: 'admin',
            status: 'active',
          },
          {
            id: memberUser.id,
            name: memberUser.name,
            email: memberUser.email,
            role: 'member',
            status: 'active',
          },
          {
            id: guestUser.id,
            name: guestUser.name,
            email: guestUser.email,
            role: 'guest',
            status: 'active',
          },
        ],
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should filter users by search term', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findMany as jest.Mock).mockResolvedValue([memberUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .query({ search: 'member' });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe(memberUser.email);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'member', mode: 'insensitive' } },
              { email: { contains: 'member', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should filter users by role', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findMany as jest.Mock).mockResolvedValue([adminUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .query({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].role).toBe('admin');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roles: { has: Role.org_admin },
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findMany as jest.Mock).mockResolvedValue([memberUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(25);

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
      });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page 2 - 1) * limit 5
          take: 5,
        })
      );
    });

    it('should return 400 if user not associated with organization', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: null,
      });

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'User not associated with an organization',
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const response = await request(app)
        .get(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: memberUser.id,
        name: memberUser.name,
        email: memberUser.email,
        role: 'member',
        status: 'active',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: memberUser.id,
          organizationId: testOrganization.id,
        },
        select: expect.any(Object),
      });
    });

    it('should return 404 if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });

    it('should transform roles correctly', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
      });

      const ownerUser = {
        ...memberUser,
        roles: [Role.owner],
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(ownerUser);

      const response = await request(app)
        .get(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully as admin', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
        role: 'admin',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.org_admin],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const updatedUser = {
        ...memberUser,
        ...updateData,
        roles: [Role.org_admin],
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const response = await request(app)
        .put(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: memberUser.id,
        name: updateData.name,
        email: updateData.email,
        role: 'admin',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: memberUser.id },
        data: {
          name: updateData.name,
          email: updateData.email,
          roles: [Role.org_admin],
        },
        select: expect.any(Object),
      });
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        name: 'Self Updated Name',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.editor],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const updatedUser = {
        ...memberUser,
        name: updateData.name,
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Mock as member user updating themselves
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.user = { ...memberUser, organization: testOrganization };
        next();
      });

      const response = await request(app)
        .put(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        )
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
    });

    it('should not allow non-admin users to update others', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.editor], // Not admin
      });

      // Mock as member user trying to update another user
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.user = { ...memberUser, organization: testOrganization };
        next();
      });

      const response = await request(app)
        .put(`/api/users/${adminUser.id}`) // Different user ID
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        )
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should not allow non-admin users to change roles', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.editor], // Not admin
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const updatedUser = {
        ...memberUser,
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Mock as member user updating themselves
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.user = { ...memberUser, organization: testOrganization };
        next();
      });

      const response = await request(app)
        .put(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        )
        .send({ name: 'Updated Name', role: 'admin' }); // Trying to elevate role

      expect(response.status).toBe(200);
      // Role should not be updated for non-admin
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: memberUser.id },
        data: {
          name: 'Updated Name',
          // roles should not be in the update data
        },
        select: expect.any(Object),
      });
    });

    it('should trigger webhook on user update', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.org_admin],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const updatedUser = {
        ...memberUser,
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const triggerWebhookSpy = jest
        .spyOn(webhookService, 'triggerWebhook')
        .mockResolvedValue();

      const response = await request(app)
        .put(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(triggerWebhookSpy).toHaveBeenCalledWith(
        testOrganization.id,
        'user.updated',
        expect.objectContaining({
          userId: memberUser.id,
          email: memberUser.email,
          name: 'Updated Name',
          updatedBy: expect.objectContaining({
            id: adminUser.id,
          }),
          changes: expect.objectContaining({
            name: true,
          }),
        })
      );
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully as admin', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.org_admin],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(memberUser);

      const response = await request(app)
        .delete(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: memberUser.id },
      });
    });

    it('should not allow users to delete themselves', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Cannot delete your own account',
      });
    });

    it('should not allow non-admin users to delete others', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.editor], // Not admin
      });

      // Mock as member user
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.user = { ...memberUser, organization: testOrganization };
        next();
      });

      const response = await request(app)
        .delete(`/api/users/${guestUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Insufficient permissions' });
    });

    it('should return 404 if user to delete not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.org_admin],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/users/non-existent-id')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('POST /api/users/invite', () => {
    it('should invite user successfully as admin', async () => {
      const inviteData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'member',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          organizationId: testOrganization.id,
          roles: [Role.org_admin],
        })
        .mockResolvedValueOnce(null); // No existing user

      const newUser = {
        id: 'new-user-id',
        email: inviteData.email,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const triggerWebhookSpy = jest
        .spyOn(webhookService, 'triggerWebhook')
        .mockResolvedValue();

      const response = await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send(inviteData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: 'User invited successfully',
        inviteId: newUser.id,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: inviteData.email,
          name: inviteData.name,
          password: 'hashed-password',
          roles: [Role.editor], // member role
          organizationId: testOrganization.id,
        },
        select: expect.any(Object),
      });

      expect(triggerWebhookSpy).toHaveBeenCalledWith(
        testOrganization.id,
        'user.created',
        expect.objectContaining({
          userId: newUser.id,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          invitedBy: expect.objectContaining({
            id: adminUser.id,
          }),
        })
      );
    });

    it('should invite admin user with correct roles', async () => {
      const inviteData = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          organizationId: testOrganization.id,
          roles: [Role.org_admin],
        })
        .mockResolvedValueOnce(null);

      const newUser = {
        id: 'new-admin-id',
        email: inviteData.email,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const response = await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send(inviteData);

      expect(response.status).toBe(200);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          roles: [Role.org_admin], // admin role
        }),
        select: expect.any(Object),
      });
    });

    it('should invite guest user with correct roles', async () => {
      const inviteData = {
        email: 'guest@example.com',
        name: 'Guest User',
        role: 'guest',
      };

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          organizationId: testOrganization.id,
          roles: [Role.org_admin],
        })
        .mockResolvedValueOnce(null);

      const newUser = {
        id: 'new-guest-id',
        email: inviteData.email,
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const response = await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send(inviteData);

      expect(response.status).toBe(200);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          roles: [Role.viewer], // guest role
        }),
        select: expect.any(Object),
      });
    });

    it('should not allow non-admin users to invite', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.editor], // Not admin
      });

      // Mock as member user
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res, next) => {
        req.user = { ...memberUser, organization: testOrganization };
        next();
      });

      const response = await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        )
        .send({
          email: 'newuser@example.com',
          role: 'member',
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        error: 'Insufficient permissions to invite users',
      });
    });

    it('should return 409 if user already exists', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          organizationId: testOrganization.id,
          roles: [Role.org_admin],
        })
        .mockResolvedValueOnce(memberUser); // Existing user

      const response = await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send({
          email: memberUser.email,
          role: 'member',
        });

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        error: 'User with this email already exists',
      });
    });

    it('should generate secure invite tokens and passwords', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          organizationId: testOrganization.id,
          roles: [Role.org_admin],
        })
        .mockResolvedValueOnce(null);

      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
      });

      await request(app)
        .post('/api/users/invite')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send({
          email: 'test@example.com',
          role: 'member',
        });

      // Verify crypto.randomBytes was called for both invite token and temp password
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(32); // Invite token
      expect(mockCrypto.randomBytes).toHaveBeenCalledWith(16); // Temp password
      expect(hashPassword).toHaveBeenCalled();
    });
  });

  describe('Middleware integration', () => {
    it('should require authentication', async () => {
      (authMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should require admin permissions', async () => {
      (adminMiddleware as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(403).json({ error: 'Admin access required' });
      });

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(memberUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Admin access required' });
    });

    it('should require organization access', async () => {
      (requireOrganizationAccess as jest.Mock).mockImplementationOnce(
        (req, res) => {
          res.status(403).json({ error: 'Organization access required' });
        }
      );

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: 'Organization access required' });
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/users')
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        );

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        error: 'Failed to fetch users',
        message: 'Database connection failed',
      });
    });

    it('should handle webhook failures gracefully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        organizationId: testOrganization.id,
        roles: [Role.org_admin],
      });

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(memberUser);

      const updatedUser = {
        ...memberUser,
        name: 'Updated Name',
        updatedAt: new Date(),
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      // Mock webhook failure
      jest
        .spyOn(webhookService, 'triggerWebhook')
        .mockRejectedValue(new Error('Webhook service unavailable'));

      const response = await request(app)
        .put(`/api/users/${memberUser.id}`)
        .set(
          'Authorization',
          `Bearer ${generateTestToken(adminUser.id, testOrganization.id)}`
        )
        .send({ name: 'Updated Name' });

      // Should still succeed even if webhook fails
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });
  });
});
