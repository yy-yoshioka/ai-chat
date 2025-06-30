import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

describe('Users Routes', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let organizationId: string;

  beforeEach(async () => {
    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
      },
    });
    organizationId = organization.id;

    // Create regular user
    const user = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: 'hashed_password',
        name: 'Regular User',
        roles: [Role.viewer],
        organizationId,
      },
    });
    userId = user.id;
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: 'hashed_password',
        name: 'Admin User',
        roles: [Role.owner],
        organizationId,
      },
    });
    adminId = admin.id;
    adminToken = jwt.sign(
      { userId: admin.id, email: admin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );
  });

  describe('GET /api/users', () => {
    it('should return users list for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `auth-token=${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('total', 2);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 1);
      expect(response.body.users).toHaveLength(2);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `auth-token=${adminToken}`)
        .query({ role: 'owner' });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].roles).toContain('owner');
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `auth-token=${adminToken}`)
        .query({ search: 'admin@' });

      expect(response.status).toBe(200);
      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0].email).toBe('admin@example.com');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user roles as admin', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', `auth-token=${adminToken}`)
        .send({ roles: [Role.editor] });

      expect(response.status).toBe(200);
      expect(response.body.roles).toContain('editor');
    });

    it('should update user name as admin', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', `auth-token=${adminToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/non-existent-id')
        .set('Cookie', `auth-token=${adminToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Cookie', `auth-token=${authToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user as admin', async () => {
      const response = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Cookie', `auth-token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');

      const deletedUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      expect(deletedUser).toBeNull();
    });

    it('should prevent self-deletion', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Cookie', `auth-token=${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Cannot delete your own account');
    });
  });

  describe('POST /api/users/invite', () => {
    it('should send invitation as admin', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Cookie', `auth-token=${adminToken}`)
        .send({
          email: 'newuser@example.com',
          role: Role.editor,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Invitation sent successfully');
    });

    it('should prevent duplicate invitations', async () => {
      // Create existing user
      await prisma.user.create({
        data: {
          email: 'existing@example.com',
          password: 'hashed',
          organizationId,
        },
      });

      const response = await request(app)
        .post('/api/users/invite')
        .set('Cookie', `auth-token=${adminToken}`)
        .send({
          email: 'existing@example.com',
          role: Role.editor,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/users/invite')
        .set('Cookie', `auth-token=${adminToken}`)
        .send({
          email: 'invalid-email',
          role: Role.editor,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});