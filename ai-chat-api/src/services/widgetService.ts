import { prisma } from '../lib/prisma';
import { generateWidgetKey } from '../utils/widgetKey';

export const getWidgetsByOrganization = async (
  organizationId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  } = {}
) => {
  const { page = 1, limit = 20, search, status = 'all' } = options;

  const offset = (page - 1) * limit;

  const where = {
    company: {
      organizationId,
    },
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        {
          company: { name: { contains: search, mode: 'insensitive' as const } },
        },
      ],
    }),
    ...(status !== 'all' && {
      isActive: status === 'active',
    }),
  };

  const [widgets, total] = await Promise.all([
    prisma.widget.findMany({
      where,
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.widget.count({ where }),
  ]);

  return {
    widgets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createWidget = async (data: {
  name: string;
  companyId: string;
  organizationId: string;
  theme?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  fontFamily?: string;
}) => {
  // Verify company belongs to organization
  const company = await prisma.company.findFirst({
    where: {
      id: data.companyId,
      organizationId: data.organizationId,
    },
  });

  if (!company) {
    throw new Error('Company not found or access denied');
  }

  const widgetKey = generateWidgetKey();

  return prisma.widget.create({
    data: {
      ...data,
      widgetKey,
      theme: data.theme || 'light',
      primaryColor: data.primaryColor || '#007bff',
      secondaryColor: data.secondaryColor || '#6c757d',
      backgroundColor: data.backgroundColor || '#ffffff',
      textColor: data.textColor || '#212529',
      borderRadius: data.borderRadius || 8,
      fontFamily: data.fontFamily || 'system-ui',
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
    },
  });
};

export const getWidgetById = async (id: string, organizationId: string) => {
  const widget = await prisma.widget.findFirst({
    where: {
      id,
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
          organizationId: true,
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
          chatLogs: true,
        },
      },
    },
  });

  if (!widget) {
    throw new Error('Widget not found or access denied');
  }

  return widget;
};

export const updateWidget = async (
  id: string,
  organizationId: string,
  data: Partial<{
    name: string;
    isActive: boolean;
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    borderRadius: number;
    fontFamily: string;
    logoUrl: string;
  }>
) => {
  // Verify widget belongs to organization
  const widget = await prisma.widget.findFirst({
    where: {
      id,
      company: {
        organizationId,
      },
    },
  });

  if (!widget) {
    throw new Error('Widget not found or access denied');
  }

  return prisma.widget.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          plan: true,
        },
      },
    },
  });
};

export const deleteWidget = async (id: string, organizationId: string) => {
  // Verify widget belongs to organization
  const widget = await prisma.widget.findFirst({
    where: {
      id,
      company: {
        organizationId,
      },
    },
  });

  if (!widget) {
    throw new Error('Widget not found or access denied');
  }

  return prisma.widget.delete({
    where: { id },
  });
};

export const getWidgetAnalytics = async (
  id: string,
  organizationId: string
) => {
  // Verify widget belongs to organization
  const widget = await prisma.widget.findFirst({
    where: {
      id,
      company: {
        organizationId,
      },
    },
  });

  if (!widget) {
    throw new Error('Widget not found or access denied');
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalChats, monthlyChats, helpfulCount, totalFeedback, topQuestions] =
    await Promise.all([
      prisma.chatLog.count({
        where: { widgetId: id },
      }),
      prisma.chatLog.count({
        where: {
          widgetId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.messageFeedback.count({
        where: {
          chatLog: { widgetId: id },
          helpful: true,
        },
      }),
      prisma.messageFeedback.count({
        where: {
          chatLog: { widgetId: id },
        },
      }),
      prisma.chatLog.groupBy({
        by: ['question'],
        where: {
          widgetId: id,
          createdAt: { gte: thirtyDaysAgo },
        },
        _count: { question: true },
        orderBy: { _count: { question: 'desc' } },
        take: 10,
      }),
    ]);

  return {
    totalChats,
    monthlyChats,
    avgSatisfaction: totalFeedback > 0 ? (helpfulCount / totalFeedback) * 5 : 0,
    topQuestions: topQuestions.map((q) => ({
      question: q.question,
      count: q._count.question,
    })),
  };
};
