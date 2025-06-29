export const DEFAULT_ACCENT_COLOR = '#3b82f6';

export const DEFAULT_WIDGET_FORM = {
  name: '',
  accentColor: DEFAULT_ACCENT_COLOR,
  logoUrl: '',
  companyId: '',
} as const;

export const WIDGET_EMBED_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const WIDGET_STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
} as const;

export const WIDGET_ROUTES = {
  CREATE: '/admin/:orgId/widgets/create',
  EDIT: '/admin/:orgId/widgets/:widgetId/edit',
  SETTINGS: '/admin/:orgId/settings/widgets',
} as const;