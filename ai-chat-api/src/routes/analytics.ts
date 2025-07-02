import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  requireOrganizationAccess,
  OrganizationRequest,
} from '../middleware/organizationAccess';
import { prisma } from '../lib/prisma';
import {
  getAnalytics,
  trackEvent,
  getEventContext,
  generateSessionId,
  EventTypes,
} from '../lib/analytics';

const router = Router();

/**
 * Track event endpoint
 */
router.post('/track', async (req: Request, res: Response) => {
  try {
    const { widgetKey, eventType, eventName, properties, userId, anonymousId } =
      req.body;

    if (!widgetKey || !eventType) {
      return res
        .status(400)
        .json({ error: 'widgetKey and eventType are required' });
    }

    // Find widget and company
    const widget = await prisma.widget.findUnique({
      where: { widgetKey },
      include: { company: true },
    });

    if (!widget || !widget.isActive) {
      return res.status(404).json({ error: 'Widget not found or inactive' });
    }

    const sessionId = generateSessionId(req);
    const context = getEventContext(req);

    await trackEvent({
      companyId: widget.companyId,
      widgetId: widget.id,
      userId,
      anonymousId,
      sessionId,
      eventType,
      eventName,
      properties,
      context,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get company analytics
 */
router.get(
  '/company',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { startDate, endDate, widgetId } = req.query;

      const start = startDate
        ? new Date(startDate as string)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      const analytics = await getAnalytics({
        companyId: req.companyId!,
        widgetId: widgetId as string,
        startDate: start,
        endDate: end,
      });

      res.json(analytics);
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get KPI dashboard data
 */
router.get(
  '/kpi',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { period = '30d' } = req.query;

      let startDate: Date;
      const endDate = new Date();

      switch (period) {
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get company info
      const company = await prisma.company.findUnique({
        where: { id: req.companyId! },
        include: {
          widgets: true,
          _count: {
            select: {
              users: true,
              widgets: true,
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Calculate WAU (Weekly Active Users)
      const weeklyActiveUsers = await prisma.event.groupBy({
        by: ['userId', 'anonymousId'],
        where: {
          companyId: req.companyId!,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            lte: endDate,
          },
          OR: [{ userId: { not: null } }, { anonymousId: { not: null } }],
        },
      });

      // Calculate ARPU (Average Revenue Per User)
      const totalRevenue = await calculateTotalRevenue(
        req.companyId!,
        startDate,
        endDate
      );
      const totalUsers = company._count.users || 1;
      const arpu = totalRevenue / totalUsers;

      // Get message stats
      const messageStats = await prisma.event.groupBy({
        by: ['eventType'],
        where: {
          companyId: req.companyId!,
          eventType: EventTypes.MESSAGE_SENT,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: { id: true },
      });

      const totalMessages = messageStats.reduce(
        (sum, stat) => sum + stat._count.id,
        0
      );

      // Get conversion stats
      const conversionStats = await prisma.event.count({
        where: {
          companyId: req.companyId!,
          eventType: EventTypes.CONVERSION,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Daily stats for charts
      const dailyStats = await getDailyKPIStats(
        req.companyId!,
        startDate,
        endDate
      );

      // Widget performance
      const widgetPerformance = await Promise.all(
        company.widgets.map(async (widget) => {
          const widgetEvents = await prisma.event.count({
            where: {
              widgetId: widget.id,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          const widgetMessages = await prisma.event.count({
            where: {
              widgetId: widget.id,
              eventType: EventTypes.MESSAGE_SENT,
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            },
          });

          return {
            widgetId: widget.id,
            widgetKey: widget.widgetKey,
            name: widget.name,
            totalEvents: widgetEvents,
            totalMessages: widgetMessages,
            isActive: widget.isActive,
          };
        })
      );

      res.json({
        company: {
          id: company.id,
          name: company.name,
          plan: company.plan,
          totalWidgets: company._count.widgets,
          totalUsers: company._count.users,
          tokenBalance: company.tokenBalance,
        },
        kpi: {
          wau: weeklyActiveUsers.length,
          arpu: Math.round(arpu * 100) / 100,
          totalMessages,
          totalConversions: conversionStats,
          conversionRate:
            totalMessages > 0
              ? Math.round((conversionStats / totalMessages) * 10000) / 100
              : 0,
        },
        period: {
          start: startDate,
          end: endDate,
          days: Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
        dailyStats,
        widgetPerformance,
      });
    } catch (error) {
      console.error('Get KPI error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get real-time stats
 */
router.get(
  '/realtime',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

      // Active users in last hour
      const activeUsersLastHour = await prisma.event.groupBy({
        by: ['userId', 'anonymousId'],
        where: {
          companyId: req.companyId!,
          createdAt: {
            gte: lastHour,
            lte: now,
          },
          OR: [{ userId: { not: null } }, { anonymousId: { not: null } }],
        },
      });

      // Messages in last 24h
      const messagesLast24h = await prisma.event.count({
        where: {
          companyId: req.companyId!,
          eventType: EventTypes.MESSAGE_SENT,
          createdAt: {
            gte: last24h,
            lte: now,
          },
        },
      });

      // Active widgets
      const activeWidgets = await prisma.widget.count({
        where: {
          companyId: req.companyId!,
          isActive: true,
        },
      });

      // Recent events
      const recentEvents = await prisma.event.findMany({
        where: {
          companyId: req.companyId!,
          createdAt: {
            gte: lastHour,
            lte: now,
          },
        },
        include: {
          widget: {
            select: {
              name: true,
              widgetKey: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      res.json({
        activeUsersLastHour: activeUsersLastHour.length,
        messagesLast24h,
        activeWidgets,
        recentEvents: recentEvents.map((event) => ({
          id: event.id,
          eventType: event.eventType,
          eventName: event.eventName,
          widgetName: event.widget?.name,
          createdAt: event.createdAt,
          properties: event.properties,
        })),
        timestamp: now,
      });
    } catch (error) {
      console.error('Get realtime stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Calculate total revenue for ARPU
 */
async function calculateTotalRevenue(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  // This is a simplified calculation
  // In a real app, you'd integrate with Stripe to get actual revenue data
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) return 0;

  // Estimate based on plan and usage
  let monthlyRevenue = 0;
  switch (company.plan) {
    case 'pro':
      monthlyRevenue = 29; // $29/month
      break;
    case 'enterprise':
      monthlyRevenue = 99; // $99/month
      break;
    default:
      monthlyRevenue = 0;
  }

  // Calculate pro-rated revenue for the period
  const days = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (monthlyRevenue / 30) * days;
}

/**
 * Get daily KPI statistics
 */
async function getDailyKPIStats(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const events = await prisma.event.findMany({
    where: {
      companyId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      createdAt: true,
      eventType: true,
      userId: true,
      anonymousId: true,
    },
  });

  const dailyStatsMap = new Map<
    string,
    {
      date: string;
      users: Set<string>;
      messages: number;
      conversions: number;
      events: number;
    }
  >();

  events.forEach((event) => {
    const date = event.createdAt.toISOString().split('T')[0];

    if (!dailyStatsMap.has(date)) {
      dailyStatsMap.set(date, {
        date,
        users: new Set(),
        messages: 0,
        conversions: 0,
        events: 0,
      });
    }

    const dayStats = dailyStatsMap.get(date)!;
    dayStats.events++;

    const userId = event.userId || event.anonymousId;
    if (userId) {
      dayStats.users.add(userId);
    }

    if (event.eventType === EventTypes.MESSAGE_SENT) {
      dayStats.messages++;
    }

    if (event.eventType === EventTypes.CONVERSION) {
      dayStats.conversions++;
    }
  });

  return Array.from(dailyStatsMap.values())
    .map((stats) => ({
      date: stats.date,
      users: stats.users.size,
      messages: stats.messages,
      conversions: stats.conversions,
      events: stats.events,
      conversionRate:
        stats.messages > 0
          ? Math.round((stats.conversions / stats.messages) * 10000) / 100
          : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get conversation flow analytics
 */
router.get(
  '/conversation-flow',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { widgetId, startDate, endDate } = req.query;

      if (!widgetId) {
        return res.status(400).json({ error: 'widgetId is required' });
      }

      // For simplified implementation, we'll get chat logs and analyze patterns
      const chatLogs = await prisma.chatLog.findMany({
        where: {
          widgetId: widgetId as string,
          createdAt: {
            gte: startDate
              ? new Date(startDate as string)
              : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lte: endDate ? new Date(endDate as string) : new Date(),
          },
        },
        select: {
          question: true,
          answer: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 1000, // Limit to prevent performance issues
      });

      // Create flow data for Sankey diagram
      const flows = new Map<string, number>();

      // Group by question-answer pairs
      chatLogs.forEach((log) => {
        const question =
          log.question.substring(0, 50) +
          (log.question.length > 50 ? '...' : '');
        const answer =
          log.answer.substring(0, 50) + (log.answer.length > 50 ? '...' : '');
        const key = `${question}|||${answer}`;

        flows.set(key, (flows.get(key) || 0) + 1);
      });

      // Convert to nodes and links format
      const nodes = new Set<string>();
      const links: { source: string; target: string; value: number }[] = [];

      Array.from(flows.entries()).forEach(([key, value]) => {
        const [source, target] = key.split('|||');
        nodes.add(source);
        nodes.add(target);
        links.push({
          source,
          target,
          value,
        });
      });

      // Sort links by value and take top 50
      links.sort((a, b) => b.value - a.value);
      const topLinks = links.slice(0, 50);

      res.json({
        nodes: Array.from(nodes).map((label, index) => ({
          id: index,
          label,
        })),
        links: topLinks,
      });
    } catch (error) {
      console.error('Get conversation flow error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Get unresolved questions
 */
router.get(
  '/unresolved',
  authMiddleware,
  requireOrganizationAccess,
  async (req: OrganizationRequest, res: Response) => {
    try {
      const { widgetId, limit = 50 } = req.query;

      if (!widgetId) {
        return res.status(400).json({ error: 'widgetId is required' });
      }

      // Get chat logs with negative feedback or containing apology keywords
      const unresolvedChats = await prisma.chatLog.findMany({
        where: {
          widgetId: widgetId as string,
          OR: [
            {
              // Has negative feedback
              feedback: {
                some: { helpful: false },
              },
            },
            {
              // AI couldn't answer properly
              answer: {
                contains: 'お答えできません',
              },
            },
            {
              answer: {
                contains: 'わかりません',
              },
            },
            {
              answer: {
                contains: '申し訳ございません',
              },
            },
          ],
        },
        include: {
          feedback: {
            where: { helpful: false },
            select: {
              feedback: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      });

      // Group similar questions
      const groups = groupSimilarQuestions(unresolvedChats);

      res.json({
        questions: groups,
        total: unresolvedChats.length,
      });
    } catch (error) {
      console.error('Get unresolved questions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * Group similar questions
 */
interface ChatLogData {
  question: string;
  createdAt: Date;
}

function groupSimilarQuestions(chatLogs: ChatLogData[]) {
  const groups: Map<string, ChatLogData[]> = new Map();

  chatLogs.forEach((chat) => {
    // Simple grouping by first 20 characters
    const key = chat.question.substring(0, 20).toLowerCase().trim();

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(chat);
  });

  // Convert to array format
  return Array.from(groups.entries())
    .map(([_key, chats]) => ({
      pattern: chats[0].question,
      count: chats.length,
      examples: chats.slice(0, 3),
      firstOccurrence: chats[chats.length - 1].createdAt,
      lastOccurrence: chats[0].createdAt,
    }))
    .sort((a, b) => b.count - a.count);
}

export { router as analyticsRoutes };
export default router;
