import { prisma } from '../lib/prisma';
import { webhookService } from './webhookService';
import { Role, Prisma } from '@prisma/client';

interface CreateOrganizationData {
  name: string;
  slug: string;
  userId: string;
}

interface UpdateOrganizationData {
  name?: string;
  slug?: string;
  settings?: Record<string, unknown>;
}

interface AssociateWidgetData {
  organizationId: string;
  widgetId: string;
  companyId?: string;
}

export class OrganizationManagementService {
  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationData) {
    // Check if slug is unique
    const existingOrg = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existingOrg) {
      throw new Error('Organization slug already exists');
    }

    // Create organization and make the user an owner
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        users: {
          connect: { id: data.userId },
        },
        settings: {
          dashboard: {
            layout: [],
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Update user to be an owner
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        roles: [Role.owner],
      },
    });

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId: organization.id,
        userId: data.userId,
        action: 'organization_created',
        resource: 'organization',
        resourceId: organization.id,
        success: true,
        details: {
          name: data.name,
          slug: data.slug,
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      organization.id,
      'organization.created',
      {
        organizationId: organization.id,
        name: organization.name,
        slug: organization.slug,
        createdBy: data.userId,
        timestamp: new Date().toISOString(),
      }
    );

    return organization;
  }

  /**
   * Get organization details with full data
   */
  async getOrganization(organizationId: string, userId: string) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        users: {
          some: { id: userId },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            roles: true,
            createdAt: true,
          },
        },
        companies: {
          include: {
            widgets: {
              select: {
                id: true,
                name: true,
                widgetKey: true,
                isActive: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                widgets: true,
                users: true,
              },
            },
          },
        },
        knowledgeBases: {
          select: {
            id: true,
            name: true,
            status: true,
            chunks: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            users: true,
            companies: true,
            faqs: true,
            knowledgeBases: true,
          },
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found or access denied');
    }

    // Get additional stats
    const [totalChats, monthlyChats, activeWidgets] = await Promise.all([
      prisma.chatLog.count({
        where: {
          widget: {
            company: {
              organizationId,
            },
          },
        },
      }),
      prisma.chatLog.count({
        where: {
          widget: {
            company: {
              organizationId,
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.widget.count({
        where: {
          company: {
            organizationId,
          },
          isActive: true,
        },
      }),
    ]);

    return {
      ...organization,
      stats: {
        totalChats,
        monthlyChats,
        activeWidgets,
      },
    };
  }

  /**
   * Update organization
   */
  async updateOrganization(
    organizationId: string,
    userId: string,
    data: UpdateOrganizationData
  ) {
    // Check permissions
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        roles: {
          hasSome: [Role.owner, Role.org_admin],
        },
      },
    });

    if (!user) {
      throw new Error('Insufficient permissions to update organization');
    }

    // Check if slug is unique if being changed
    if (data.slug) {
      const existingOrg = await prisma.organization.findFirst({
        where: {
          slug: data.slug,
          NOT: { id: organizationId },
        },
      });

      if (existingOrg) {
        throw new Error('Organization slug already exists');
      }
    }

    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: data.name,
        slug: data.slug,
        settings: data.settings as Prisma.InputJsonValue,
      },
    });

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId,
        action: 'organization_updated',
        resource: 'organization',
        resourceId: organizationId,
        success: true,
        details: {
          changes: {
            name: data.name !== undefined,
            slug: data.slug !== undefined,
            settings: data.settings !== undefined,
          },
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      organizationId,
      'organization.updated',
      {
        organizationId,
        changes: {
          name: data.name,
          slug: data.slug,
          settings: data.settings ? Object.keys(data.settings) : undefined,
        },
        updatedBy: userId,
        timestamp: new Date().toISOString(),
      }
    );

    return organization;
  }

  /**
   * Delete organization (soft delete)
   */
  async deleteOrganization(organizationId: string, userId: string) {
    // Check if user is owner
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
        roles: { has: Role.owner },
      },
    });

    if (!user) {
      throw new Error('Only organization owners can delete the organization');
    }

    // Don't actually delete, just mark as inactive
    // In a real implementation, you might want to:
    // 1. Cancel all active subscriptions
    // 2. Export data if requested
    // 3. Schedule actual deletion after grace period

    // For now, just remove all users from the organization
    await prisma.user.updateMany({
      where: { organizationId },
      data: { organizationId: null },
    });

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId,
        action: 'organization_deleted',
        resource: 'organization',
        resourceId: organizationId,
        success: true,
        risk_level: 'critical',
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      organizationId,
      'organization.deleted',
      {
        organizationId,
        deletedBy: userId,
        timestamp: new Date().toISOString(),
      }
    );

    return { success: true };
  }

  /**
   * Associate a widget with an organization
   */
  async associateWidget(data: AssociateWidgetData) {
    const { organizationId, widgetId, companyId } = data;

    // Verify widget exists
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: { company: true },
    });

    if (!widget) {
      throw new Error('Widget not found');
    }

    // If companyId provided, use it. Otherwise, use widget's existing company
    const targetCompanyId = companyId || widget.companyId;

    // Update company to belong to organization
    await prisma.company.update({
      where: { id: targetCompanyId },
      data: { organizationId },
    });

    // If widget belongs to a different company, move it
    if (widget.companyId !== targetCompanyId) {
      await prisma.widget.update({
        where: { id: widgetId },
        data: { companyId: targetCompanyId },
      });
    }

    return {
      success: true,
      widgetId,
      companyId: targetCompanyId,
      organizationId,
    };
  }

  /**
   * Remove widget association from organization
   */
  async disassociateWidget(organizationId: string, widgetId: string) {
    // Verify widget belongs to organization
    const widget = await prisma.widget.findFirst({
      where: {
        id: widgetId,
        company: {
          organizationId,
        },
      },
    });

    if (!widget) {
      throw new Error('Widget not found in this organization');
    }

    // Create a new company for the widget (orphan it)
    const newCompany = await prisma.company.create({
      data: {
        name: `Orphaned - ${widget.name}`,
        email: 'orphaned@example.com',
        plan: 'free',
      },
    });

    // Move widget to new company
    await prisma.widget.update({
      where: { id: widgetId },
      data: { companyId: newCompany.id },
    });

    return { success: true };
  }

  /**
   * Get organization activity log
   */
  async getActivityLog(
    organizationId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.securityAuditLog.findMany({
        where: { organizationId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.securityAuditLog.count({
        where: { organizationId },
      }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get organization usage statistics
   */
  async getUsageStats(
    organizationId: string,
    period: 'day' | 'week' | 'month' = 'month'
  ) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Get chat statistics
    const chatStats = await prisma.chatLog.groupBy({
      by: ['createdAt'],
      where: {
        widget: {
          company: {
            organizationId,
          },
        },
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get user activity
    const activeUsers = await prisma.user.count({
      where: {
        organizationId,
        updatedAt: {
          gte: startDate,
        },
      },
    });

    // Get knowledge base updates
    const kbUpdates = await prisma.knowledgeBase.count({
      where: {
        organizationId,
        OR: [
          { createdAt: { gte: startDate } },
          { processedAt: { gte: startDate } },
        ],
      },
    });

    // Get widget performance
    const widgetPerformance = await prisma.widget.findMany({
      where: {
        company: {
          organizationId,
        },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            chatLogs: {
              where: {
                createdAt: { gte: startDate },
              },
            },
          },
        },
      },
      orderBy: {
        chatLogs: {
          _count: 'desc',
        },
      },
      take: 10,
    });

    return {
      period,
      startDate,
      endDate: now,
      stats: {
        totalChats: chatStats.reduce((sum, stat) => sum + stat._count, 0),
        dailyAverage: Math.round(
          chatStats.reduce((sum, stat) => sum + stat._count, 0) /
            Math.max(
              1,
              Math.ceil(
                (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
              )
            )
        ),
        activeUsers,
        kbUpdates,
        topWidgets: widgetPerformance.map((w) => ({
          id: w.id,
          name: w.name,
          chatCount: w._count.chatLogs,
        })),
      },
    };
  }

  /**
   * Transfer organization ownership
   */
  async transferOwnership(
    organizationId: string,
    currentOwnerId: string,
    newOwnerId: string
  ) {
    // Verify current owner
    const currentOwner = await prisma.user.findFirst({
      where: {
        id: currentOwnerId,
        organizationId,
        roles: { has: Role.owner },
      },
    });

    if (!currentOwner) {
      throw new Error('You must be the current owner to transfer ownership');
    }

    // Verify new owner is in organization
    const newOwner = await prisma.user.findFirst({
      where: {
        id: newOwnerId,
        organizationId,
      },
    });

    if (!newOwner) {
      throw new Error('New owner must be a member of the organization');
    }

    // Update roles
    await Promise.all([
      prisma.user.update({
        where: { id: currentOwnerId },
        data: { roles: [Role.org_admin] },
      }),
      prisma.user.update({
        where: { id: newOwnerId },
        data: { roles: [Role.owner] },
      }),
    ]);

    // Log security audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId: currentOwnerId,
        action: 'ownership_transferred',
        resource: 'organization',
        resourceId: organizationId,
        success: true,
        risk_level: 'high',
        details: {
          from: currentOwnerId,
          to: newOwnerId,
        },
      },
    });

    // Trigger webhook
    await webhookService.triggerWebhook(
      organizationId,
      'organization.ownership_transferred',
      {
        organizationId,
        previousOwner: {
          id: currentOwner.id,
          email: currentOwner.email,
        },
        newOwner: {
          id: newOwner.id,
          email: newOwner.email,
        },
        timestamp: new Date().toISOString(),
      }
    );

    return { success: true };
  }

  /**
   * Get all widgets in an organization
   */
  async getOrganizationWidgets(organizationId: string) {
    const widgets = await prisma.widget.findMany({
      where: {
        company: {
          organizationId,
        },
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            plan: true,
          },
        },
        _count: {
          select: {
            chatLogs: true,
            knowledgeBases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return widgets.map((widget) => ({
      id: widget.id,
      name: widget.name,
      widgetKey: widget.widgetKey,
      isActive: widget.isActive,
      company: widget.company,
      stats: {
        totalChats: widget._count.chatLogs,
        knowledgeBases: widget._count.knowledgeBases,
      },
      theme: {
        primaryColor: widget.primaryColor,
        accentColor: widget.accentColor,
        theme: widget.theme,
      },
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    }));
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId: string) {
    return prisma.organization.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            users: true,
            companies: true,
          },
        },
        companies: {
          include: {
            _count: {
              select: {
                widgets: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const organizationManagementService =
  new OrganizationManagementService();
