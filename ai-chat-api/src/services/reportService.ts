import { prisma } from '../lib/prisma';
import {
  exportToCSV,
  formatDateForCSV,
  REPORT_FIELD_MAPPINGS,
} from '../utils/csvExporter';
// Removed unused import

interface ExportOptions {
  format: 'csv' | 'pdf';
  reportTypes: string[];
  startDate?: Date;
  endDate?: Date;
  organizationId: string;
}

// Get chat sessions data
const getChatSessionsData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const whereClause: {
    widget: {
      company: {
        organizationId: string;
      };
    };
    createdAt?: {
      gte?: Date;
      lte?: Date;
    };
  } = {
    widget: {
      company: {
        organizationId,
      },
    },
  };

  if (startDate || endDate) {
    whereClause.createdAt = {};
    if (startDate) whereClause.createdAt.gte = startDate;
    if (endDate) whereClause.createdAt.lte = endDate;
  }

  const sessions = await prisma.chatLog.findMany({
    where: whereClause,
    include: {
      widget: {
        include: {
          company: true,
        },
      },
      messages: {
        include: {
          feedbacks: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return sessions.map((session) => ({
    id: session.id,
    widgetId: session.widgetId,
    widgetName: session.widget.name,
    companyName: session.widget.company.name,
    userAgent: session.userAgent,
    question: session.question,
    answer: session.messages[0]?.content || '',
    satisfaction: session.messages[0]?.feedbacks[0]?.helpful
      ? 'Satisfied'
      : 'Unsatisfied',
    createdAt: formatDateForCSV(session.createdAt),
  }));
};

// Get user analytics data
const getUserAnalyticsData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const users = await prisma.user.findMany({
    where: {
      organizationId,
    },
    include: {
      organizations: true,
      _count: {
        select: {
          chatLogs: {
            where:
              startDate || endDate
                ? {
                    createdAt: {
                      gte: startDate,
                      lte: endDate,
                    },
                  }
                : undefined,
          },
        },
      },
    },
  });

  const userAnalytics = await Promise.all(
    users.map(async (user) => {
      // Get average satisfaction
      const feedbacks = await prisma.messageFeedback.findMany({
        where: {
          chatLog: {
            userId: user.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      });

      const avgSatisfaction =
        feedbacks.length > 0
          ? (feedbacks.filter((f) => f.helpful).length / feedbacks.length) * 100
          : 0;

      return {
        userId: user.id,
        email: user.email,
        name: user.name || 'N/A',
        organizationName: user.organizations[0]?.name || 'N/A',
        roles: user.roles.join(', '),
        chatCount: user._count.chatLogs,
        avgSatisfaction: `${avgSatisfaction.toFixed(1)}%`,
        lastActive: formatDateForCSV(user.updatedAt),
      };
    })
  );

  return userAnalytics;
};

// Get satisfaction report data
const getSatisfactionData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const widgets = await prisma.widget.findMany({
    where: {
      company: {
        organizationId,
      },
    },
  });

  const satisfactionData = await Promise.all(
    widgets.map(async (widget) => {
      const chatLogs = await prisma.chatLog.findMany({
        where: {
          widgetId: widget.id,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          messages: {
            include: {
              feedbacks: true,
            },
          },
        },
      });

      const totalChats = chatLogs.length;
      const ratedChats = chatLogs.filter((log) =>
        log.messages.some((msg) => msg.feedbacks.length > 0)
      ).length;

      const satisfiedCount = chatLogs.filter((log) =>
        log.messages.some((msg) =>
          msg.feedbacks.some((feedback) => feedback.helpful)
        )
      ).length;

      const unsatisfiedCount = ratedChats - satisfiedCount;
      const satisfactionRate =
        ratedChats > 0
          ? ((satisfiedCount / ratedChats) * 100).toFixed(1)
          : '0.0';

      return {
        period:
          startDate && endDate
            ? `${formatDateForCSV(startDate)} - ${formatDateForCSV(endDate)}`
            : 'All Time',
        widgetName: widget.name,
        totalChats,
        ratedChats,
        satisfiedCount,
        unsatisfiedCount,
        satisfactionRate: `${satisfactionRate}%`,
      };
    })
  );

  return satisfactionData;
};

// Get unresolved questions data
const getUnresolvedQuestionsData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const chatLogs = await prisma.chatLog.findMany({
    where: {
      widget: {
        company: {
          organizationId,
        },
      },
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      messages: {
        some: {
          feedbacks: {
            some: {
              helpful: false,
            },
          },
        },
      },
    },
    include: {
      widget: true,
      messages: {
        include: {
          feedbacks: true,
        },
      },
    },
  });

  // Group by question
  const questionMap = new Map<
    string,
    {
      frequency: number;
      widgetNames: Set<string>;
      lastOccurred: Date;
    }
  >();

  chatLogs.forEach((log) => {
    const existing = questionMap.get(log.question) || {
      frequency: 0,
      widgetNames: new Set<string>(),
      lastOccurred: log.createdAt,
    };

    existing.frequency++;
    existing.widgetNames.add(log.widget.name);
    if (log.createdAt > existing.lastOccurred) {
      existing.lastOccurred = log.createdAt;
    }

    questionMap.set(log.question, existing);
  });

  return Array.from(questionMap.entries()).map(([question, data]) => ({
    question,
    frequency: data.frequency,
    widgetName: Array.from(data.widgetNames).join(', '),
    lastOccurred: formatDateForCSV(data.lastOccurred),
    status: 'Unresolved',
  }));
};

// Get usage summary data
const getUsageSummaryData = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error('Organization not found');
  }

  // Generate daily summaries
  const days = [];
  const current = new Date(
    startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const end = endDate || new Date();

  while (current <= end) {
    const dayStart = new Date(current);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(current);
    dayEnd.setHours(23, 59, 59, 999);

    const [activeUsers, chatCount, apiCalls] = await Promise.all([
      prisma.user.count({
        where: {
          organizationId,
          chatLogs: {
            some: {
              createdAt: {
                gte: dayStart,
                lte: dayEnd,
              },
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
            gte: dayStart,
            lte: dayEnd,
          },
        },
      }),
      // Assuming we track API calls somewhere
      0, // Placeholder for API calls
    ]);

    // Calculate approximate storage (in MB)
    const storageUsed = (chatCount * 0.01).toFixed(2); // Rough estimate

    days.push({
      date: formatDateForCSV(dayStart),
      organizationName: organization.name,
      activeUsers,
      chatCount,
      faqViews: 0, // Placeholder
      apiCalls,
      storageUsed,
    });

    current.setDate(current.getDate() + 1);
  }

  return days;
};

// Main export function
export const exportReports = async (
  options: ExportOptions
): Promise<Buffer> => {
  const { format, reportTypes, startDate, endDate, organizationId } = options;

  // Collect all data
  const allData: Record<string, Record<string, unknown>[]> = {};

  for (const reportType of reportTypes) {
    switch (reportType) {
      case 'chat_sessions':
        allData[reportType] = await getChatSessionsData(
          organizationId,
          startDate,
          endDate
        );
        break;
      case 'user_analytics':
        allData[reportType] = await getUserAnalyticsData(
          organizationId,
          startDate,
          endDate
        );
        break;
      case 'satisfaction':
        allData[reportType] = await getSatisfactionData(
          organizationId,
          startDate,
          endDate
        );
        break;
      case 'unresolved':
        allData[reportType] = await getUnresolvedQuestionsData(
          organizationId,
          startDate,
          endDate
        );
        break;
      case 'usage_summary':
        allData[reportType] = await getUsageSummaryData(
          organizationId,
          startDate,
          endDate
        );
        break;
    }
  }

  // Generate output based on format
  if (format === 'csv') {
    // For CSV, we'll create separate sections for each report type
    let csvContent = '';

    for (const [reportType, data] of Object.entries(allData)) {
      if (data && Array.isArray(data) && data.length > 0) {
        // Add section header
        csvContent += `\n\n### ${getReportTypeName(reportType)} ###\n`;

        // Add data with appropriate fields
        const fields =
          REPORT_FIELD_MAPPINGS[
            reportType as keyof typeof REPORT_FIELD_MAPPINGS
          ];
        csvContent += exportToCSV(data, { fields });
      }
    }

    return Buffer.from(csvContent, 'utf8');
  } else {
    // For PDF, create a combined document
    const { PDFGenerator } = await import('../utils/pdfGenerator');
    const pdf = new PDFGenerator({
      title: 'Export Report',
      author: 'AI Chat System',
    });

    pdf.addTitle('Export Report');
    pdf.addSubtitle(`Generated: ${new Date().toLocaleString('ja-JP')}`);

    for (const [reportType, data] of Object.entries(allData)) {
      if (data && Array.isArray(data) && data.length > 0) {
        pdf.addPageBreak();
        pdf.addTitle(getReportTypeName(reportType));

        const columns = getReportColumns(reportType);
        if (columns) {
          pdf.addTable(columns, data);
        }
      }
    }

    return pdf.getBuffer();
  }
};

const getReportTypeName = (reportType: string): string => {
  const names: Record<string, string> = {
    chat_sessions: 'Chat Sessions Report',
    user_analytics: 'User Analytics Report',
    satisfaction: 'Satisfaction Report',
    unresolved: 'Unresolved Questions Report',
    usage_summary: 'Usage Summary Report',
  };
  return names[reportType] || reportType;
};

interface ReportColumn {
  key: string;
  label: string;
  width: number;
}

const getReportColumns = (reportType: string): ReportColumn[] | null => {
  const columnSets: Record<string, ReportColumn[]> = {
    chat_sessions: [
      { key: 'id', label: 'ID', width: 80 },
      { key: 'widgetName', label: 'Widget', width: 100 },
      { key: 'question', label: 'Question', width: 150 },
      { key: 'satisfaction', label: 'Satisfaction', width: 80 },
      { key: 'createdAt', label: 'Date', width: 100 },
    ],
    user_analytics: [
      { key: 'email', label: 'Email', width: 120 },
      { key: 'name', label: 'Name', width: 100 },
      { key: 'chatCount', label: 'Chats', width: 60 },
      { key: 'avgSatisfaction', label: 'Satisfaction', width: 80 },
      { key: 'lastActive', label: 'Last Active', width: 100 },
    ],
    satisfaction: [
      { key: 'widgetName', label: 'Widget', width: 120 },
      { key: 'totalChats', label: 'Total', width: 60 },
      { key: 'ratedChats', label: 'Rated', width: 60 },
      { key: 'satisfactionRate', label: 'Rate', width: 70 },
    ],
    unresolved: [
      { key: 'question', label: 'Question', width: 200 },
      { key: 'frequency', label: 'Count', width: 60 },
      { key: 'widgetName', label: 'Widget', width: 120 },
      { key: 'status', label: 'Status', width: 80 },
    ],
    usage_summary: [
      { key: 'date', label: 'Date', width: 80 },
      { key: 'activeUsers', label: 'Users', width: 60 },
      { key: 'chatCount', label: 'Chats', width: 60 },
      { key: 'apiCalls', label: 'API', width: 60 },
      { key: 'storageUsed', label: 'Storage', width: 80 },
    ],
  };

  return columnSets[reportType] || null;
};
