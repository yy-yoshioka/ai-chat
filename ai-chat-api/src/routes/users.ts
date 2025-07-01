import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { requireOrganizationAccess } from '../middleware/organizationAccess';
import crypto from 'crypto';
import { hashPassword } from '../utils/password';
import { webhookService } from '../services/webhookService';
import { Prisma, Role } from '@prisma/client';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);
router.use(requireOrganizationAccess);

// LIST users
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || '';
    const _status = (req.query.status as string) || '';

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(400)
        .json({ error: 'User not associated with an organization' });
    }

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      organizationId: user.organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    // Map frontend roles to database roles
    if (role) {
      if (role === 'admin') {
        where.roles = { has: Role.org_admin };
      } else if (role === 'member') {
        where.roles = { has: Role.editor };
      } else if (role === 'guest') {
        where.roles = { has: Role.viewer };
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Transform database roles to frontend format
    const transformedUsers = users.map((user) => {
      let role = 'guest';
      const status = 'active';

      if (
        user.roles.includes(Role.owner) ||
        user.roles.includes(Role.org_admin)
      ) {
        role = 'admin';
      } else if (user.roles.includes(Role.editor)) {
        role = 'member';
      }

      return {
        id: user.id,
        name: user.name || '',
        email: user.email,
        role,
        status,
        lastLogin: user.updatedAt.toISOString(),
        createdAt: user.createdAt.toISOString(),
      };
    });

    res.json({
      users: transformedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET single user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    });

    if (!requestingUser?.organizationId) {
      return res
        .status(400)
        .json({ error: 'User not associated with an organization' });
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        organizationId: requestingUser.organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform database roles to frontend format
    let role = 'guest';
    const status = 'active';

    if (
      user.roles.includes(Role.owner) ||
      user.roles.includes(Role.org_admin)
    ) {
      role = 'admin';
    } else if (user.roles.includes(Role.editor)) {
      role = 'member';
    }

    res.json({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role,
      status,
      lastLogin: user.updatedAt.toISOString(),
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// UPDATE user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const userId = req.user!.id;

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, roles: true },
    });

    if (!requestingUser?.organizationId) {
      return res
        .status(400)
        .json({ error: 'User not associated with an organization' });
    }

    // Check if user can modify other users
    const isAdmin =
      requestingUser.roles.includes('owner') ||
      requestingUser.roles.includes('org_admin');
    if (!isAdmin && id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: requestingUser.organizationId,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData: Prisma.UserUpdateInput = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (role !== undefined && isAdmin) {
      // Convert frontend role to database roles
      if (role === 'admin') {
        updateData.roles = [Role.org_admin];
      } else if (role === 'member') {
        updateData.roles = [Role.editor];
      } else if (role === 'guest') {
        updateData.roles = [Role.viewer];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Transform response
    let responseRole = 'guest';
    const responseStatus = 'active';

    if (
      updatedUser.roles.includes(Role.owner) ||
      updatedUser.roles.includes(Role.org_admin)
    ) {
      responseRole = 'admin';
    } else if (updatedUser.roles.includes(Role.editor)) {
      responseRole = 'member';
    }

    // Trigger webhook for user.updated event
    webhookService
      .triggerWebhook(requestingUser.organizationId, 'user.updated', {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: responseRole,
        updatedBy: {
          id: userId,
          email: req.user!.email,
        },
        changes: {
          name: name !== undefined,
          email: email !== undefined,
          role: role !== undefined,
        },
        timestamp: new Date().toISOString(),
      })
      .catch((error) => {
        console.error('Failed to trigger webhook:', error);
      });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email,
      role: responseRole,
      status: responseStatus,
      lastLogin: updatedUser.updatedAt.toISOString(),
      createdAt: updatedUser.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (id === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, roles: true },
    });

    if (!requestingUser?.organizationId) {
      return res
        .status(400)
        .json({ error: 'User not associated with an organization' });
    }

    // Check if user is admin
    const isAdmin =
      requestingUser.roles.includes('owner') ||
      requestingUser.roles.includes('org_admin');
    if (!isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id,
        organizationId: requestingUser.organizationId,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST invite user
router.post('/invite', async (req: Request, res: Response) => {
  try {
    const { email, role, name } = req.body;
    const userId = req.user!.id;

    const requestingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, roles: true },
    });

    if (!requestingUser?.organizationId) {
      return res
        .status(400)
        .json({ error: 'User not associated with an organization' });
    }

    // Check if user is admin
    const isAdmin =
      requestingUser.roles.includes('owner') ||
      requestingUser.roles.includes('org_admin');
    if (!isAdmin) {
      return res
        .status(403)
        .json({ error: 'Insufficient permissions to invite users' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: 'User with this email already exists' });
    }

    // Create invite token
    const _inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Convert frontend role to database roles
    let dbRoles: Role[] = [Role.viewer];
    if (role === 'admin') {
      dbRoles = [Role.org_admin];
    } else if (role === 'member') {
      dbRoles = [Role.editor];
    }

    // Create user with temporary password
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await hashPassword(tempPassword);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        roles: dbRoles,
        organizationId: requestingUser.organizationId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // In a real implementation, you would:
    // 1. Store the invite token in a separate table
    // 2. Send an email with the invite link
    // 3. Handle the invite acceptance flow

    // Trigger webhook for user.created event
    webhookService
      .triggerWebhook(requestingUser.organizationId, 'user.created', {
        userId: newUser.id,
        email: newUser.email,
        name: name || null,
        role: role,
        invitedBy: {
          id: userId,
          email: requestingUser.email || req.user!.email,
        },
        timestamp: new Date().toISOString(),
      })
      .catch((error) => {
        console.error('Failed to trigger webhook:', error);
      });

    res.json({
      success: true,
      message: 'User invited successfully',
      inviteId: newUser.id,
    });
  } catch (error) {
    console.error('Invite user error:', error);
    res.status(500).json({
      error: 'Failed to invite user',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
