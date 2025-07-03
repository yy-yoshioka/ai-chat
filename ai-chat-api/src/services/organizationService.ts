import { prisma } from '../lib/prisma';

export const getUserOrganizations = async (userId: string) => {
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
          companies: {
            where: {
              widgets: {
                some: {},
              },
            },
          },
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
};

export const getOrganizationById = async (id: string, userId: string) => {
  const organization = await prisma.organization.findFirst({
    where: {
      id,
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          roles: true,
        },
      },
      companies: {
        include: {
          widgets: {
            select: {
              id: true,
              name: true,
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
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found or access denied');
  }

  return organization;
};

export const updateOrganization = async (
  id: string,
  userId: string,
  data: {
    name?: string;
    settings?: Record<string, unknown>;
  }
) => {
  // Check if user has permission to update
  const organization = await prisma.organization.findFirst({
    where: {
      id,
      users: {
        some: {
          id: userId,
          roles: {
            hasSome: ['owner', 'org_admin'],
          },
        },
      },
    },
  });

  if (!organization) {
    throw new Error('Organization not found or insufficient permissions');
  }

  return prisma.organization.update({
    where: { id },
    data: {
      name: data.name,
      settings: data.settings as any,
      updatedAt: new Date(),
    },
  });
};

export const getOrganizationStats = async (organizationId: string) => {
  const [userCount, widgetCount, activeWidgetCount, totalChats, monthlyChats] =
    await Promise.all([
      prisma.user.count({
        where: { organizationId },
      }),
      prisma.widget.count({
        where: {
          company: {
            organizationId,
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
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

  return {
    userCount,
    widgetCount,
    activeWidgetCount,
    totalChats,
    monthlyChats,
  };
};
