import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { metricsMiddleware } from '../middleware/metrics';
import { prisma } from '../lib/prisma';
import { parse } from 'json2csv';
import { Prisma } from '@prisma/client';
import { exportReports } from '../services/reportService';

const router = Router();

router.use(authMiddleware);
router.use(metricsMiddleware);

// GET /reports - Summary report
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, organizationId } = req.query;

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const whereClause: Prisma.ChatLogWhereInput = {};
    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter;
    }
    if (organizationId && req.user) {
      // Verify user has access to this organization
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { organizationId: true },
      });

      if (user?.organizationId === organizationId) {
        whereClause.user = {
          organizationId: organizationId as string,
        };
      }
    }

    const [totalUsers, totalChats, chatLogs] = await Promise.all([
      prisma.user.count({
        where: organizationId
          ? { organizationId: organizationId as string }
          : undefined,
      }),
      prisma.chatLog.count({ where: whereClause }),
      prisma.chatLog.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          tokens: true,
        },
      }),
    ]);

    // Calculate daily stats
    const dailyStatsMap = new Map<
      string,
      { chats: number; satisfaction: number }
    >();

    chatLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      const existing = dailyStatsMap.get(date) || { chats: 0, satisfaction: 0 };
      existing.chats += 1;
      existing.satisfaction = Math.random() * 2 + 3; // Mock satisfaction score
      dailyStatsMap.set(date, existing);
    });

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        chats: stats.chats,
        satisfaction: parseFloat(stats.satisfaction.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const avgSatisfaction =
      dailyStats.length > 0
        ? parseFloat(
            (
              dailyStats.reduce((sum, stat) => sum + stat.satisfaction, 0) /
              dailyStats.length
            ).toFixed(2)
          )
        : 0;

    res.json({
      totalUsers,
      totalChats,
      avgSatisfaction,
      responseTime: 250, // Mock response time in ms
      dailyStats,
    });
  } catch (error) {
    console.error('Reports summary error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// GET /reports/chart - Chart data
router.get('/chart', async (req: Request, res: Response) => {
  try {
    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate = new Date().toISOString(),
    } = req.query;

    const chatLogs = await prisma.chatLog.findMany({
      where: {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const chartData = new Map<string, number>();

    chatLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      chartData.set(date, (chartData.get(date) || 0) + 1);
    });

    const data = Array.from(chartData.entries()).map(([date, count]) => ({
      date,
      chats: count,
      satisfaction: Math.random() * 2 + 3, // Mock data
    }));

    res.json({
      totalUsers: 0,
      totalChats: chatLogs.length,
      avgSatisfaction: 4.2,
      responseTime: 250,
      dailyStats: data,
    });
  } catch (error) {
    console.error('Reports chart error:', error);
    res.status(500).json({ error: 'Failed to generate chart data' });
  }
});

// GET /reports/csv - CSV export
router.get('/csv', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause: Prisma.ChatLogWhereInput = {};
    if (startDate || endDate) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);
      whereClause.createdAt = dateFilter;
    }

    const chatLogs = await prisma.chatLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        widget: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const csvData = chatLogs.map((log) => ({
      id: log.id,
      date: log.createdAt.toISOString(),
      user: log.user?.email || 'Anonymous',
      userName: log.user?.name || '',
      widget: log.widget?.name || 'Unknown',
      question: log.question,
      answer: log.answer,
      tokens: log.tokens || 0,
    }));

    const csv = parse(csvData, {
      fields: [
        'id',
        'date',
        'user',
        'userName',
        'widget',
        'question',
        'answer',
        'tokens',
      ],
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="chat-logs-${new Date().toISOString()}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error('Reports CSV error:', error);
    res.status(500).json({ error: 'Failed to generate CSV' });
  }
});

// POST /reports/export - Export multiple report types
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { format, reportTypes, startDate, endDate } = req.body;

    // Validate input
    if (!format || !['csv', 'pdf'].includes(format)) {
      return res
        .status(400)
        .json({ error: 'Invalid format. Must be csv or pdf' });
    }

    if (
      !reportTypes ||
      !Array.isArray(reportTypes) ||
      reportTypes.length === 0
    ) {
      return res
        .status(400)
        .json({ error: 'At least one report type must be selected' });
    }

    const validReportTypes = [
      'chat_sessions',
      'user_analytics',
      'satisfaction',
      'unresolved',
      'usage_summary',
    ];
    const invalidTypes = reportTypes.filter(
      (type) => !validReportTypes.includes(type)
    );
    if (invalidTypes.length > 0) {
      return res
        .status(400)
        .json({ error: `Invalid report types: ${invalidTypes.join(', ')}` });
    }

    // Get user's organization
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { organizationId: true },
    });

    if (!user?.organizationId) {
      return res
        .status(403)
        .json({ error: 'User must belong to an organization' });
    }

    // Generate the report
    const buffer = await exportReports({
      format,
      reportTypes,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      organizationId: user.organizationId,
    });

    // Set appropriate headers
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report-export-${timestamp}.${format}`;

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    } else {
      res.setHeader('Content-Type', 'application/pdf');
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length.toString());

    // Send the file
    res.send(buffer);
  } catch (error) {
    console.error('Report export error:', error);
    res.status(500).json({ error: 'Failed to export reports' });
  }
});

export default router;
