import { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma';
import { PRICING_PLANS } from './stripe';

export interface UsageData {
  companyId: string;
  messages: number;
  tokens: number;
  date?: Date;
}

interface UsageRequest extends Request {
  companyId?: string;
  widget?: {
    companyId: string;
  };
}

/**
 * Track usage for a company
 */
export async function trackUsage(data: UsageData) {
  const date = data.date || new Date();
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  try {
    // Upsert usage record for the day
    await prisma.usage.upsert({
      where: {
        companyId_date: {
          companyId: data.companyId,
          date: dateOnly,
        },
      },
      update: {
        messages: {
          increment: data.messages,
        },
        tokens: {
          increment: data.tokens,
        },
        updatedAt: new Date(),
      },
      create: {
        companyId: data.companyId,
        date: dateOnly,
        messages: data.messages,
        tokens: data.tokens,
      },
    });

    console.log(
      `Usage tracked for company ${data.companyId}: ${data.messages} messages, ${data.tokens} tokens`
    );
  } catch (error) {
    console.error('Failed to track usage:', error);
    throw error;
  }
}

/**
 * Get current month usage for a company
 */
export async function getCurrentMonthUsage(companyId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usage = await prisma.usage.findMany({
    where: {
      companyId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  return usage.reduce(
    (total, daily) => ({
      messages: total.messages + daily.messages,
      tokens: total.tokens + daily.tokens,
    }),
    { messages: 0, tokens: 0 }
  );
}

/**
 * Check if company has exceeded usage limits
 */
export async function checkUsageLimits(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const currentUsage = await getCurrentMonthUsage(companyId);
  const planLimits = PRICING_PLANS[company.plan];

  const messageLimit = planLimits.monthlyMessages;
  const tokenLimit = planLimits.monthlyTokens + (company.tokenBalance || 0);

  return {
    messages: {
      used: currentUsage.messages,
      limit: messageLimit,
      exceeded: currentUsage.messages >= messageLimit,
      percentage: Math.round((currentUsage.messages / messageLimit) * 100),
    },
    tokens: {
      used: currentUsage.tokens,
      limit: tokenLimit,
      exceeded: currentUsage.tokens >= tokenLimit,
      percentage: Math.round((currentUsage.tokens / tokenLimit) * 100),
    },
  };
}

/**
 * Deduct tokens from company balance
 */
export async function deductTokens(companyId: string, tokenAmount: number) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  const newBalance = (company.tokenBalance || 0) - tokenAmount;

  if (newBalance < 0) {
    throw new Error('Insufficient token balance');
  }

  await prisma.company.update({
    where: { id: companyId },
    data: {
      tokenBalance: newBalance,
    },
  });

  return newBalance;
}

/**
 * Generate usage report for billing
 */
export async function generateUsageReport(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const usage = await prisma.usage.findMany({
    where: {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  const totalUsage = usage.reduce(
    (total, daily) => ({
      messages: total.messages + daily.messages,
      tokens: total.tokens + daily.tokens,
    }),
    { messages: 0, tokens: 0 }
  );

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      plan: true,
    },
  });

  return {
    company,
    period: {
      start: startDate,
      end: endDate,
    },
    totalUsage,
    dailyUsage: usage,
    planLimits: company ? PRICING_PLANS[company.plan] : null,
  };
}

/**
 * Middleware to track API usage
 */
export function createUsageTrackingMiddleware() {
  return async (req: UsageRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data: string | object) {
      // Track usage after response is sent
      setImmediate(async () => {
        try {
          const companyId = req.companyId || req.widget?.companyId;

          if (companyId) {
            // Estimate token usage based on response length
            const responseText =
              typeof data === 'string' ? data : JSON.stringify(data);
            const estimatedTokens = Math.ceil(responseText.length / 4); // Rough estimate: 4 chars per token

            await trackUsage({
              companyId,
              messages: 1,
              tokens: estimatedTokens,
            });
          }
        } catch (error) {
          console.error('Usage tracking middleware error:', error);
        }
      });

      return originalSend.call(this, data);
    };

    next();
  };
}
