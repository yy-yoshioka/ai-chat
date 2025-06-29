import type { WidgetSettings, Company } from '@/app/_schemas/widget';

export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    plan: 'pro',
  },
  {
    id: 'company-2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    plan: 'starter',
  },
  {
    id: 'company-3',
    name: 'Enterprise Solutions',
    email: 'info@enterprise.com',
    plan: 'enterprise',
  },
];

export const mockWidgets: WidgetSettings[] = [
  {
    id: 'widget-1',
    widgetKey: 'wgt_abc123',
    name: 'カスタマーサポート',
    companyId: 'company-1',
    isActive: true,
    accentColor: '#3b82f6',
    logoUrl: null,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      id: 'company-1',
      name: 'Acme Corporation',
      plan: 'pro',
    },
    _count: {
      chatLogs: 156,
    },
  },
  {
    id: 'widget-2',
    widgetKey: 'wgt_def456',
    name: '営業お問い合わせ',
    companyId: 'company-1',
    isActive: false,
    accentColor: '#10b981',
    logoUrl: 'https://example.com/logo.png',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      id: 'company-1',
      name: 'Acme Corporation',
      plan: 'pro',
    },
    _count: {
      chatLogs: 89,
    },
  },
  {
    id: 'widget-3',
    widgetKey: 'wgt_ghi789',
    name: 'ヘルプデスク',
    companyId: 'company-2',
    isActive: true,
    accentColor: '#f59e0b',
    logoUrl: null,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    company: {
      id: 'company-2',
      name: 'TechStart Inc',
      plan: 'starter',
    },
    _count: {
      chatLogs: 42,
    },
  },
];

export function createMockWidget(overrides?: Partial<WidgetSettings>): WidgetSettings {
  return {
    ...mockWidgets[0],
    ...overrides,
  };
}