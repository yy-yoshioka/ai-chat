import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { userManagementService } from '../services/userManagementService';
import { Permission, Role } from '@prisma/client';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = express.Router();

// Input validation schemas
const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  roles: z.array(z.nativeEnum(Role)).default([Role.viewer]),
});

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.nativeEnum(Role)).optional(),
});

const listUsersSchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users - List all users in organization
router.get(
  '/',
  requirePermission(Permission.ORG_READ),
  validateRequest({ query: listUsersSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const result = await userManagementService.listUsers({
        organizationId,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        role: req.query.role as string,
        status: req.query.status as string,
      });

      res.json(result);
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/users/invitations - List pending invitations
router.get(
  '/invitations',
  requirePermission(Permission.ORG_INVITE_USERS),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const invitations =
        await userManagementService.listInvitations(organizationId);
      res.json(invitations);
    } catch (error) {
      console.error('List invitations error:', error);
      res.status(500).json({
        error: 'Failed to fetch invitations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// GET /api/users/:id - Get single user
router.get(
  '/:id',
  requirePermission(Permission.ORG_READ),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const user = await userManagementService.getUser(id, organizationId);
      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      const status =
        error instanceof Error && error.message === 'User not found'
          ? 404
          : 500;
      res.status(status).json({
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      });
    }
  }
);

// POST /api/users/invite - Invite a new user
router.post(
  '/invite',
  requirePermission(Permission.ORG_INVITE_USERS),
  validateRequest({ body: inviteUserSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: invitedById } = req.user!;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const invitation = await userManagementService.createInvitation({
        ...req.body,
        organizationId,
        invitedById,
      });

      res.json({
        success: true,
        invitationId: invitation.id,
        message: 'Invitation sent successfully',
      });
    } catch (error) {
      console.error('Invite user error:', error);
      const status =
        error instanceof Error && error.message.includes('already') ? 409 : 500;
      res.status(status).json({
        error: error instanceof Error ? error.message : 'Failed to invite user',
      });
    }
  }
);

// POST /api/users/invitations/:id/resend - Resend invitation
router.post(
  '/invitations/:id/resend',
  requirePermission(Permission.ORG_INVITE_USERS),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const result = await userManagementService.resendInvitation(
        id,
        organizationId
      );
      res.json(result);
    } catch (error) {
      console.error('Resend invitation error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to resend invitation',
      });
    }
  }
);

// DELETE /api/users/invitations/:id - Cancel invitation
router.delete(
  '/invitations/:id',
  requirePermission(Permission.ORG_INVITE_USERS),
  async (req: Request, res: Response) => {
    try {
      const { organizationId } = req.user!;
      const { id } = req.params;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      const result = await userManagementService.cancelInvitation(
        id,
        organizationId
      );
      res.json(result);
    } catch (error) {
      console.error('Cancel invitation error:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to cancel invitation',
      });
    }
  }
);

// PUT /api/users/:id - Update user
router.put(
  '/:id',
  requirePermission(Permission.ORG_WRITE),
  validateRequest({ body: updateUserSchema }),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: updatedBy } = req.user!;
      const { id } = req.params;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      // Users can update their own profile with limited permissions
      if (id === updatedBy && !req.body.roles) {
        // Allow self-update without role changes
      } else if (id !== updatedBy) {
        // Updating another user requires full permissions (already checked by middleware)
      } else {
        // Trying to change own roles
        return res.status(403).json({ error: 'Cannot change your own roles' });
      }

      const user = await userManagementService.updateUser(
        id,
        organizationId,
        req.body,
        updatedBy
      );

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update user',
      });
    }
  }
);

// DELETE /api/users/:id - Remove user from organization
router.delete(
  '/:id',
  requirePermission(Permission.ORG_WRITE),
  async (req: Request, res: Response) => {
    try {
      const { organizationId, id: deletedBy } = req.user!;
      const { id } = req.params;

      if (!organizationId) {
        return res
          .status(400)
          .json({ error: 'User not associated with an organization' });
      }

      if (id === deletedBy) {
        return res
          .status(400)
          .json({ error: 'Cannot delete your own account' });
      }

      const result = await userManagementService.deleteUser(
        id,
        organizationId,
        deletedBy
      );
      res.json(result);
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to delete user',
      });
    }
  }
);

// Public route to accept invitation (no auth required)
router.post(
  '/accept-invitation',
  validateRequest({
    body: z.object({
      token: z.string(),
      password: z.string().min(8),
    }),
  }),
  async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;
      const user = await userManagementService.acceptInvitation(
        token,
        password
      );

      res.json({
        success: true,
        userId: user.id,
        email: user.email,
        message: 'Invitation accepted successfully',
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      const status =
        error instanceof Error &&
        (error.message.includes('Invalid') || error.message.includes('expired'))
          ? 400
          : 500;
      res.status(status).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to accept invitation',
      });
    }
  }
);

export default router;
