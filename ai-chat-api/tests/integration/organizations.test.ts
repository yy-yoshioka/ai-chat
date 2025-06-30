import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

describe('Organizations Routes', () => {
  let authToken: string;
  let orgAdminToken: string;
  let userId: string;
  let orgAdminId: string;
  let organizationId: string;

  beforeEach(async () => {
    // Create test organization
    const organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
        settings: { dashboard: { layout: [] } },
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

    // Create org admin
    const orgAdmin = await prisma.user.create({
      data: {
        email: 'orgadmin@example.com',
        password: 'hashed_password',
        name: 'Org Admin',
        roles: [Role.org_admin],
        organizationId,
      },
    });
    orgAdminId = orgAdmin.id;
    orgAdminToken = jwt.sign(
      { userId: orgAdmin.id, email: orgAdmin.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Create test data
    await prisma.widget.createMany({
      data: [
        {
          widgetKey: 'widget1',
          name: 'Test Widget 1',
          companyId: (
            await prisma.company.create({
              data: {
                name: 'Test Company',
                email: 'company@example.com',
                organizationId,
              },
            })
          ).id,
        },
      ],
    });

    await prisma.fAQ.createMany({
      data: [
        {
          question: 'Test FAQ 1',
          answer: 'Test Answer 1',
          organizationId,
        },
        {
          question: 'Test FAQ 2',
          answer: 'Test Answer 2',
          organizationId,
        },
      ],
    });
  });

  describe('GET /api/organizations', () => {
    it('should return organization details for authenticated user', async () => {
      const response = await request(app)
        .get('/api/organizations')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', organizationId);
      expect(response.body).toHaveProperty('name', 'Test Organization');
      expect(response.body).toHaveProperty('slug', 'test-org');
      expect(response.body).toHaveProperty('userCount', 2);
      expect(response.body).toHaveProperty('widgetCount', 1);
      expect(response.body).toHaveProperty('plan', 'pro');
    });

    it('should return 404 for user without organization', async () => {
      // Create user without organization
      const orphanUser = await prisma.user.create({
        data: {
          email: 'orphan@example.com',
          password: 'hashed_password',
        },
      });
      const orphanToken = jwt.sign(
        { userId: orphanUser.id, email: orphanUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );

      const response = await request(app)
        .get('/api/organizations')
        .set('Cookie', `auth-token=${orphanToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Organization not found');
    });
  });

  describe('GET /api/organizations/stats', () => {
    it('should return organization statistics', async () => {
      const response = await request(app)
        .get('/api/organizations/stats')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalUsers', 2);
      expect(response.body).toHaveProperty('activeUsers');
      expect(response.body).toHaveProperty('totalWidgets', 1);
      expect(response.body).toHaveProperty('totalChats', 0);
      expect(response.body).toHaveProperty('totalFaqs', 2);
      expect(response.body).toHaveProperty('storageUsed');
      expect(response.body).toHaveProperty('apiCallsToday');
    });

    it('should calculate active users correctly', async () => {
      // Update user to be active
      await prisma.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() },
      });

      const response = await request(app)
        .get('/api/organizations/stats')
        .set('Cookie', `auth-token=${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.activeUsers).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/organizations', () => {
    it('should update organization name as org admin', async () => {
      const response = await request(app)
        .put('/api/organizations')
        .set('Cookie', `auth-token=${orgAdminToken}`)
        .send({ name: 'Updated Organization' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Organization');
    });

    it('should update organization settings as org admin', async () => {
      const newSettings = {
        dashboard: {
          layout: ['widget1', 'widget2'],
          theme: 'dark',
        },
      };

      const response = await request(app)
        .put('/api/organizations')
        .set('Cookie', `auth-token=${orgAdminToken}`)
        .send({ settings: newSettings });

      expect(response.status).toBe(200);

      // Verify settings were updated in database
      const updatedOrg = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      expect(updatedOrg?.settings).toEqual(newSettings);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/api/organizations')
        .set('Cookie', `auth-token=${authToken}`)
        .send({ name: 'Updated Organization' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Insufficient permissions');
    });

    it('should allow owner to update organization', async () => {
      // Create owner user
      const owner = await prisma.user.create({
        data: {
          email: 'owner@example.com',
          password: 'hashed_password',
          roles: [Role.owner],
          organizationId,
        },
      });
      const ownerToken = jwt.sign(
        { userId: owner.id, email: owner.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' }
      );

      const response = await request(app)
        .put('/api/organizations')
        .set('Cookie', `auth-token=${ownerToken}`)
        .send({ name: 'Owner Updated' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Owner Updated');
    });

    it('should handle database errors gracefully', async () => {
      jest
        .spyOn(prisma.organization, 'update')
        .mockRejectedValueOnce(new Error('DB Error'));

      const response = await request(app)
        .put('/api/organizations')
        .set('Cookie', `auth-token=${orgAdminToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        'error',
        'Failed to update organization'
      );
    });
  });
});
