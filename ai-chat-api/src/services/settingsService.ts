import { prisma } from '../lib/prisma';
import crypto from 'crypto';

// API Key管理
export const createAPIKey = async (organizationId: string, name: string) => {
  const key = `ak_${crypto.randomBytes(24).toString('hex')}`;

  return prisma.apiKey.create({
    data: {
      name,
      key,
      organizationId,
    },
  });
};

export const listAPIKeys = async (organizationId: string) => {
  return prisma.apiKey.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      key: true,
      lastUsed: true,
      createdAt: true,
    },
  });
};

export const deleteAPIKey = async (keyId: string, organizationId: string) => {
  return prisma.apiKey.delete({
    where: {
      id: keyId,
      organizationId,
    },
  });
};

export const validateAPIKey = async (key: string) => {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: { organization: true },
  });

  if (apiKey) {
    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    });
  }

  return apiKey;
};

// Notification Settings
export const getNotificationSettings = async (organizationId: string) => {
  let settings = await prisma.notificationSettings.findUnique({
    where: { organizationId },
  });

  if (!settings) {
    settings = await prisma.notificationSettings.create({
      data: {
        organizationId,
        settings: {},
      },
    });
  }

  return settings;
};

export const updateNotificationSettings = async (
  organizationId: string,
  settings: Record<string, { email?: boolean; app?: boolean }>
) => {
  return prisma.notificationSettings.upsert({
    where: { organizationId },
    update: {
      settings,
      updatedAt: new Date(),
    },
    create: {
      organizationId,
      settings,
    },
  });
};

// Notifications
export const createNotification = async (data: {
  organizationId: string;
  userId?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) => {
  return prisma.notification.create({
    data,
  });
};

export const getUserNotifications = async (
  organizationId: string,
  userId?: string,
  limit: number = 50
) => {
  return prisma.notification.findMany({
    where: {
      organizationId,
      ...(userId && { userId }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};

export const markAllNotificationsAsRead = async (
  organizationId: string,
  userId?: string
) => {
  return prisma.notification.updateMany({
    where: {
      organizationId,
      ...(userId && { userId }),
      read: false,
    },
    data: { read: true },
  });
};

export const getUnreadNotificationCount = async (
  organizationId: string,
  userId?: string
) => {
  return prisma.notification.count({
    where: {
      organizationId,
      ...(userId && { userId }),
      read: false,
    },
  });
};
