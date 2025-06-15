import { prisma } from './prisma';
import { Request } from 'express';

export interface EventProperties {
  [key: string]: any;
}

export interface EventContext {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  pageUrl?: string;
}

export interface TrackEventParams {
  companyId: string;
  widgetId?: string;
  userId?: string;
  anonymousId?: string;
  sessionId?: string;
  eventType: string;
  eventName?: string;
  properties?: EventProperties;
  context?: EventContext;
}

/**
 * Track an event
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    await prisma.event.create({
      data: {
        companyId: params.companyId,
        widgetId: params.widgetId,
        userId: params.userId,
        anonymousId: params.anonymousId,
        sessionId: params.sessionId,
        eventType: params.eventType,
        eventName: params.eventName,
        properties: params.properties || {},
        userAgent: params.context?.userAgent,
        ipAddress: params.context?.ipAddress,
        referrer: params.context?.referrer,
        pageUrl: params.context?.pageUrl,
      },
    });
  } catch (error) {
    console.error('Failed to track event:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Extract context from Express request
 */
export function getEventContext(req: Request): EventContext {
  return {
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.connection.remoteAddress,
    referrer: req.get('Referer'),
    pageUrl: req.get('Origin'),
  };
}

/**
 * Generate session ID from request
 */
export function generateSessionId(req: Request): string {
  const userAgent = req.get('User-Agent') || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 30)); // 30-minute sessions

  return Buffer.from(`${ip}-${userAgent}-${timestamp}`)
    .toString('base64')
    .slice(0, 32);
}

/**
 * Predefined event types
 */
export const EventTypes = {
  // User identification
  IDENTIFY: 'identify',

  // Widget interactions
  WIDGET_LOADED: 'widget_loaded',
  WIDGET_OPENED: 'widget_opened',
  WIDGET_CLOSED: 'widget_closed',

  // Chat interactions
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',
  CONVERSATION_STARTED: 'conversation_started',
  CONVERSATION_ENDED: 'conversation_ended',

  // Conversions
  CONVERSION: 'conversion',
  SIGNUP: 'signup',
  PURCHASE: 'purchase',
  LEAD_GENERATED: 'lead_generated',

  // Errors
  ERROR: 'error',
  WIDGET_ERROR: 'widget_error',
} as const;

/**
 * Track user identification
 */
export async function trackIdentify(params: {
  companyId: string;
  widgetId?: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  traits?: EventProperties;
  context: EventContext;
}): Promise<void> {
  await trackEvent({
    ...params,
    eventType: EventTypes.IDENTIFY,
    properties: {
      traits: params.traits || {},
    },
  });
}

/**
 * Track message sent
 */
export async function trackMessageSent(params: {
  companyId: string;
  widgetId: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  messageLength: number;
  messageType?: string;
  context: EventContext;
}): Promise<void> {
  await trackEvent({
    ...params,
    eventType: EventTypes.MESSAGE_SENT,
    properties: {
      messageLength: params.messageLength,
      messageType: params.messageType || 'text',
    },
  });
}

/**
 * Track conversion
 */
export async function trackConversion(params: {
  companyId: string;
  widgetId?: string;
  userId?: string;
  anonymousId?: string;
  sessionId: string;
  conversionType: string;
  value?: number;
  currency?: string;
  properties?: EventProperties;
  context: EventContext;
}): Promise<void> {
  await trackEvent({
    ...params,
    eventType: EventTypes.CONVERSION,
    eventName: params.conversionType,
    properties: {
      conversionType: params.conversionType,
      value: params.value,
      currency: params.currency || 'USD',
      ...params.properties,
    },
  });
}

/**
 * Get analytics data for a company
 */
export async function getAnalytics(params: {
  companyId: string;
  widgetId?: string;
  startDate: Date;
  endDate: Date;
  eventTypes?: string[];
}): Promise<{
  totalEvents: number;
  uniqueUsers: number;
  uniqueSessions: number;
  eventsByType: Record<string, number>;
  dailyStats: Array<{
    date: string;
    events: number;
    users: number;
    sessions: number;
  }>;
  topPages: Array<{
    url: string;
    events: number;
  }>;
  conversionFunnel: Array<{
    step: string;
    users: number;
    conversionRate: number;
  }>;
}> {
  const whereClause = {
    companyId: params.companyId,
    ...(params.widgetId && { widgetId: params.widgetId }),
    createdAt: {
      gte: params.startDate,
      lte: params.endDate,
    },
    ...(params.eventTypes && { eventType: { in: params.eventTypes } }),
  };

  // Total events
  const totalEvents = await prisma.event.count({ where: whereClause });

  // Unique users (including anonymous)
  const uniqueUserIds = await prisma.event.groupBy({
    by: ['userId'],
    where: { ...whereClause, userId: { not: null } },
  });

  const uniqueAnonymousIds = await prisma.event.groupBy({
    by: ['anonymousId'],
    where: { ...whereClause, anonymousId: { not: null }, userId: null },
  });

  const uniqueUsers = uniqueUserIds.length + uniqueAnonymousIds.length;

  // Unique sessions
  const uniqueSessionsData = await prisma.event.groupBy({
    by: ['sessionId'],
    where: { ...whereClause, sessionId: { not: null } },
  });
  const uniqueSessions = uniqueSessionsData.length;

  // Events by type
  const eventsByTypeData = await prisma.event.groupBy({
    by: ['eventType'],
    where: whereClause,
    _count: { id: true },
  });

  const eventsByType: Record<string, number> = {};
  eventsByTypeData.forEach((item) => {
    eventsByType[item.eventType] = item._count.id;
  });

  // Daily stats - using simpler approach without raw SQL
  const events = await prisma.event.findMany({
    where: whereClause,
    select: {
      createdAt: true,
      userId: true,
      anonymousId: true,
      sessionId: true,
    },
  });

  const dailyStatsMap = new Map<
    string,
    { events: Set<string>; users: Set<string>; sessions: Set<string> }
  >();

  events.forEach((event) => {
    const date = event.createdAt.toISOString().split('T')[0];
    if (!dailyStatsMap.has(date)) {
      dailyStatsMap.set(date, {
        events: new Set(),
        users: new Set(),
        sessions: new Set(),
      });
    }

    const dayStats = dailyStatsMap.get(date)!;
    dayStats.events.add(event.createdAt.toISOString());

    const userId = event.userId || event.anonymousId;
    if (userId) dayStats.users.add(userId);

    if (event.sessionId) dayStats.sessions.add(event.sessionId);
  });

  const dailyStats = Array.from(dailyStatsMap.entries())
    .map(([date, stats]) => ({
      date,
      events: stats.events.size,
      users: stats.users.size,
      sessions: stats.sessions.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top pages
  const topPagesData = await prisma.event.groupBy({
    by: ['pageUrl'],
    where: { ...whereClause, pageUrl: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  const topPages = topPagesData.map((item) => ({
    url: item.pageUrl || '',
    events: item._count.id,
  }));

  // Conversion funnel (simplified)
  const funnelSteps = [
    { step: 'Widget Loaded', eventType: EventTypes.WIDGET_LOADED },
    { step: 'Widget Opened', eventType: EventTypes.WIDGET_OPENED },
    { step: 'Message Sent', eventType: EventTypes.MESSAGE_SENT },
    { step: 'Conversion', eventType: EventTypes.CONVERSION },
  ];

  const conversionFunnel = [];
  let previousUsers = 0;

  for (const [index, step] of funnelSteps.entries()) {
    const users = await prisma.event.groupBy({
      by: ['userId', 'anonymousId'],
      where: {
        ...whereClause,
        eventType: step.eventType,
      },
    });

    const userCount = users.length;
    const conversionRate =
      index === 0
        ? 100
        : previousUsers > 0
          ? (userCount / previousUsers) * 100
          : 0;

    conversionFunnel.push({
      step: step.step,
      users: userCount,
      conversionRate: Math.round(conversionRate * 100) / 100,
    });

    previousUsers = userCount;
  }

  return {
    totalEvents,
    uniqueUsers,
    uniqueSessions,
    eventsByType,
    dailyStats,
    topPages,
    conversionFunnel,
  };
}
