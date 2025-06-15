export interface WidgetTheme {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
}

export const PRESET_THEMES: Record<string, Partial<WidgetTheme>> = {
  light: {
    theme: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
  },
  dark: {
    theme: 'dark',
    primaryColor: '#0d6efd',
    secondaryColor: '#adb5bd',
    backgroundColor: '#212529',
    textColor: '#ffffff',
  },
  blue: {
    theme: 'light',
    primaryColor: '#0066cc',
    secondaryColor: '#4d94ff',
    backgroundColor: '#f8f9ff',
    textColor: '#1a1a1a',
  },
  green: {
    theme: 'light',
    primaryColor: '#28a745',
    secondaryColor: '#20c997',
    backgroundColor: '#f8fff9',
    textColor: '#1a1a1a',
  },
  purple: {
    theme: 'light',
    primaryColor: '#6f42c1',
    secondaryColor: '#9c7aea',
    backgroundColor: '#faf8ff',
    textColor: '#1a1a1a',
  },
  orange: {
    theme: 'light',
    primaryColor: '#fd7e14',
    secondaryColor: '#ffb366',
    backgroundColor: '#fff8f5',
    textColor: '#1a1a1a',
  },
};

export const FONT_FAMILIES = [
  { value: 'system-ui', label: 'System UI' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
];

/**
 * Validate hex color format
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validate theme configuration
 */
export function validateTheme(theme: Partial<WidgetTheme>): string[] {
  const errors: string[] = [];

  if (theme.theme && !['light', 'dark', 'auto'].includes(theme.theme)) {
    errors.push('Theme must be light, dark, or auto');
  }

  const colorFields = [
    'primaryColor',
    'secondaryColor',
    'backgroundColor',
    'textColor',
  ];
  colorFields.forEach((field) => {
    const color = theme[field as keyof WidgetTheme] as string;
    if (color && !isValidHexColor(color)) {
      errors.push(`${field} must be a valid hex color`);
    }
  });

  if (theme.borderRadius !== undefined) {
    if (
      typeof theme.borderRadius !== 'number' ||
      theme.borderRadius < 0 ||
      theme.borderRadius > 50
    ) {
      errors.push('Border radius must be between 0 and 50 pixels');
    }
  }

  if (
    theme.fontFamily &&
    !FONT_FAMILIES.some((f) => f.value === theme.fontFamily)
  ) {
    errors.push('Invalid font family');
  }

  return errors;
}

/**
 * Generate CSS variables for widget theme
 */
export function generateThemeCSS(theme: WidgetTheme): string {
  return `
    --widget-theme: ${theme.theme};
    --widget-primary-color: ${theme.primaryColor};
    --widget-secondary-color: ${theme.secondaryColor};
    --widget-background-color: ${theme.backgroundColor};
    --widget-text-color: ${theme.textColor};
    --widget-border-radius: ${theme.borderRadius}px;
    --widget-font-family: ${theme.fontFamily};
  `.trim();
}

/**
 * Apply preset theme to widget configuration
 */
export function applyPresetTheme(
  presetName: string,
  currentTheme: Partial<WidgetTheme>
): WidgetTheme {
  const preset = PRESET_THEMES[presetName];
  if (!preset) {
    throw new Error(`Unknown preset theme: ${presetName}`);
  }

  return {
    theme: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    backgroundColor: '#ffffff',
    textColor: '#212529',
    borderRadius: 8,
    fontFamily: 'system-ui',
    ...currentTheme,
    ...preset,
  };
}
