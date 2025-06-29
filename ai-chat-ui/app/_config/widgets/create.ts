export const DEFAULT_WIDGET_THEME = {
  primaryColor: '#3B82F6',
  secondaryColor: '#64748B',
  borderRadius: 12,
  position: 'bottom-right' as const,
};

export const DEFAULT_WIDGET_SETTINGS = {
  welcomeMessage: 'こんにちは！何かお手伝いできることはありますか？',
  placeholder: 'メッセージを入力...',
  showAvatar: true,
  enableFileUpload: false,
};

export const WIDGET_POSITIONS = [
  { value: 'bottom-right', label: '右下' },
  { value: 'bottom-left', label: '左下' },
  { value: 'top-right', label: '右上' },
  { value: 'top-left', label: '左上' },
] as const;

export const BORDER_RADIUS_MIN = 0;
export const BORDER_RADIUS_MAX = 24;

export const WIDGET_KEY_PREFIX = 'wgt_';
export const WIDGET_KEY_LENGTH = 16;
