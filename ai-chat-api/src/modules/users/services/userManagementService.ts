import { prisma } from '@shared/database/prisma';
import { Role, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { hashPassword } from '@shared/utils/password';
import { webhookService } from './webhookService';
import { sendEmail } from '@shared/utils/email';

interface CreateUserInvitationData {
  email: string;
  name?: string;
  organizationId: string;
  invitedById: string;
  roles: Role[];
}

interface UpdateUserData {
  name?: string;
  email?: string;
  roles?: Role[];
}

interface UserListParams {
  organizationId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export class UserManagementService {
  /**
   * Create a user invitation
   */
  async createInvitation(data: CreateUserInvitationData) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser?.organizationId === data.organizationId) {
      throw new Error('User already belongs to this organization');
    }

    // Check if invitation already exists
    const existingInvitation = await prisma.userInvitation.findUnique({
      where: {
        email_organizationId: {
          email: data.email,
          organizationId: data.organizationId,
        },
      },
    });

    if (existingInvitation && existingInvitation.expiresAt > new Date()) {
      throw new Error('An active invitation already exists for this email');
    }

    // Delete expired invitation if exists
    if (existingInvitation) {
      await prisma.userInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    // Create invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await prisma.userInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        organizationId: data.organizationId,
        invitedById: data.invitedById,
        token,
        roles: data.roles,
        expiresAt,
      },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    // Send invitation email
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${token}`;
    await sendEmail({
      to: data.email,
      subject: `You've been invited to join ${invitation.organization.name}`,
      html: `
        <h2>Invitation to join ${invitation.organization.name}</h2>
        <p>Hi ${data.name || 'there'},</p>
        <p>${invitation.invitedBy.name || invitation.invitedBy.email} has invited you to join ${invitation.organization.name}.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>If you're unable to click the button, copy and paste this URL into your browser:</p>
        <p>${inviteUrl}</p>
      `,
    });

    // Trigger webhook
    await webhookService.triggerWebhook(data.organizationId, 'user.invited', {
      invitationId: invitation.id,
      email: data.email,
      name: data.name,
      roles: data.roles,
      invitedBy: {
        id: invitation.invitedBy.id,
        email: invitation.invitedBy.email,
      },
      expiresAt: invitation.expiresAt.toISOString(),
      timestamp: new Date().toISOString(),
    });

    return invitation;
  }

  /**
   * Accept a user invitation
   */
  async acceptInvitation(token: string, password: string) {
    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.acceptedAt) {
      throw new Error('Invitation has already been accepted');
    }

    if (invitation.expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (user) {
      // Add user to organization if they exist but aren't part of it
      if (user.organizationId !== invitation.organizationId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            organizationId: invitation.organizationId,
            roles: invitation.roles,
          },
        });
      }
    } else {
      // Create new user
      const hashedPassword = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email: invitation.email,
          name: invitation.name,
          password: hashedPassword,
          organizationId: invitation.organizationId,
          roles: invitation.roles,
        },
      });
    }

    // Mark invitation as accepted
    await prisma.userInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      invitation.organizationId,
      'user.joined',
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        invitationId: invitation.id,
        timestamp: new Date().toISOString(),
      }
    );

    return user;
  }

  /**
   * List users in an organization with filtering
   */
  async listUsers(params: UserListParams) {
    const { organizationId, page = 1, limit = 10, search, role } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      organizationId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      // Map frontend roles to database roles
      const roleMapping: Record<string, Role[]> = {
        owner: [Role.owner],
        admin: [Role.org_admin],
        member: [Role.editor],
        guest: [Role.viewer],
        api: [Role.api_user],
        readonly: [Role.read_only],
      };

      const roles = roleMapping[role];
      if (roles) {
        where.roles = { hasSome: roles };
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
          emailVerifications: {
            select: { id: true },
            take: 1,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        ...user,
        isEmailVerified: user.emailVerifications.length > 0,
        emailVerifications: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single user
   */
  async getUser(userId: string, organizationId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        createdAt: true,
        updatedAt: true,
        emailVerifications: {
          select: { id: true },
          take: 1,
        },
        permissionOverrides: {
          where: { organizationId },
          select: {
            permission: true,
            granted: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      isEmailVerified: user.emailVerifications.length > 0,
      emailVerifications: undefined,
    };
  }

  /**
   * Update a user
   */
  async updateUser(
    userId: string,
    organizationId: string,
    data: UpdateUserData,
    updatedBy: string
  ) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent removing the last owner
    if (
      data.roles &&
      user.roles.includes(Role.owner) &&
      !data.roles.includes(Role.owner)
    ) {
      const ownerCount = await prisma.user.count({
        where: {
          organizationId,
          roles: { has: Role.owner },
        },
      });

      if (ownerCount === 1) {
        throw new Error('Cannot remove the last owner from the organization');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        roles: data.roles,
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

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId: updatedBy,
        action: 'user_updated',
        resource: 'user',
        resourceId: userId,
        success: true,
        details: {
          changes: {
            name: data.name !== undefined,
            email: data.email !== undefined,
            roles: data.roles !== undefined,
          },
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(organizationId, 'user.updated', {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      roles: updatedUser.roles,
      updatedBy,
      timestamp: new Date().toISOString(),
    });

    return updatedUser;
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string, organizationId: string, deletedBy: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent deleting the last owner
    if (user.roles.includes(Role.owner)) {
      const ownerCount = await prisma.user.count({
        where: {
          organizationId,
          roles: { has: Role.owner },
        },
      });

      if (ownerCount === 1) {
        throw new Error('Cannot delete the last owner from the organization');
      }
    }

    // Soft delete by removing from organization
    await prisma.user.update({
      where: { id: userId },
      data: {
        organizationId: null,
      },
    });

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId: deletedBy,
        action: 'user_deleted',
        resource: 'user',
        resourceId: userId,
        success: true,
        details: {
          email: user.email,
          name: user.name,
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(organizationId, 'user.deleted', {
      userId: user.id,
      email: user.email,
      name: user.name,
      deletedBy,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * List pending invitations
   */
  async listInvitations(organizationId: string) {
    const invitations = await prisma.userInvitation.findMany({
      where: {
        organizationId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return invitations;
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(invitationId: string, organizationId: string) {
    const invitation = await prisma.userInvitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new Error('Invitation has already been accepted');
    }

    await prisma.userInvitation.delete({
      where: { id: invitationId },
    });

    return { success: true };
  }

  /**
   * Resend an invitation
   */
  async resendInvitation(invitationId: string, organizationId: string) {
    const invitation = await prisma.userInvitation.findFirst({
      where: {
        id: invitationId,
        organizationId,
      },
      include: {
        organization: true,
        invitedBy: true,
      },
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.acceptedAt) {
      throw new Error('Invitation has already been accepted');
    }

    // Extend expiration
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.userInvitation.update({
      where: { id: invitationId },
      data: { expiresAt: newExpiresAt },
    });

    // Resend email
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/accept?token=${invitation.token}`;
    await sendEmail({
      to: invitation.email,
      subject: `Reminder: You've been invited to join ${invitation.organization.name}`,
      html: `
        <h2>Invitation Reminder</h2>
        <p>Hi ${invitation.name || 'there'},</p>
        <p>This is a reminder that ${invitation.invitedBy.name || invitation.invitedBy.email} has invited you to join ${invitation.organization.name}.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>If you're unable to click the button, copy and paste this URL into your browser:</p>
        <p>${inviteUrl}</p>
      `,
    });

    return { success: true, expiresAt: newExpiresAt };
  }
}

export const userManagementService = new UserManagementService();
