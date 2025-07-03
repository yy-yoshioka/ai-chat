import { prisma } from '../lib/prisma';
import { validateHexColor } from '../utils/validateHexColor';

interface ThemeData {
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  fontFamily: string;
  logoUrl?: string;
}

interface OrganizationTheme extends ThemeData {
  id: string;
  organizationId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ThemeService {
  /**
   * Get default theme for an organization
   */
  async getOrganizationDefaultTheme(
    organizationId: string
  ): Promise<ThemeData> {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const settings = organization?.settings as any;
    const defaultTheme = settings?.theme?.default || {};

    return {
      theme: defaultTheme.theme || 'light',
      primaryColor: defaultTheme.primaryColor || '#007bff',
      secondaryColor: defaultTheme.secondaryColor || '#6c757d',
      backgroundColor: defaultTheme.backgroundColor || '#ffffff',
      textColor: defaultTheme.textColor || '#212529',
      borderRadius: defaultTheme.borderRadius || 8,
      fontFamily: defaultTheme.fontFamily || 'system-ui',
      logoUrl: defaultTheme.logoUrl,
    };
  }

  /**
   * Set organization default theme
   */
  async setOrganizationDefaultTheme(
    organizationId: string,
    theme: Partial<ThemeData>,
    userId: string
  ) {
    // Validate colors
    if (theme.primaryColor) validateHexColor(theme.primaryColor);
    if (theme.secondaryColor) validateHexColor(theme.secondaryColor);
    if (theme.backgroundColor) validateHexColor(theme.backgroundColor);
    if (theme.textColor) validateHexColor(theme.textColor);

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const currentSettings = (organization.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      theme: {
        ...(currentSettings.theme || {}),
        default: {
          ...(currentSettings.theme?.default || {}),
          ...theme,
          updatedAt: new Date().toISOString(),
          updatedBy: userId,
        },
      },
    };

    const updatedOrg = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: updatedSettings,
      },
    });

    // Log audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId,
        action: 'theme_updated',
        resource: 'organization',
        resourceId: organizationId,
        success: true,
        details: {
          type: 'default_theme',
          changes: theme,
        },
      },
    });

    return updatedSettings.theme.default;
  }

  /**
   * Apply organization theme to widget
   */
  async applyOrganizationThemeToWidget(
    widgetId: string,
    organizationId: string,
    userId: string
  ) {
    const [widget, defaultTheme] = await Promise.all([
      prisma.widget.findFirst({
        where: {
          id: widgetId,
          company: {
            organizationId,
          },
        },
      }),
      this.getOrganizationDefaultTheme(organizationId),
    ]);

    if (!widget) {
      throw new Error('Widget not found or access denied');
    }

    const updatedWidget = await prisma.widget.update({
      where: { id: widgetId },
      data: {
        theme: defaultTheme.theme,
        primaryColor: defaultTheme.primaryColor,
        secondaryColor: defaultTheme.secondaryColor,
        backgroundColor: defaultTheme.backgroundColor,
        textColor: defaultTheme.textColor,
        borderRadius: defaultTheme.borderRadius,
        fontFamily: defaultTheme.fontFamily,
        logoUrl: defaultTheme.logoUrl || widget.logoUrl,
      },
    });

    // Log audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId,
        action: 'theme_applied',
        resource: 'widget',
        resourceId: widgetId,
        success: true,
        details: {
          source: 'organization_default',
        },
      },
    });

    return updatedWidget;
  }

  /**
   * Validate widget theme against organization constraints
   */
  async validateWidgetTheme(
    widgetId: string,
    theme: Partial<ThemeData>,
    organizationId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate hex colors
    try {
      if (theme.primaryColor) validateHexColor(theme.primaryColor);
      if (theme.secondaryColor) validateHexColor(theme.secondaryColor);
      if (theme.backgroundColor) validateHexColor(theme.backgroundColor);
      if (theme.textColor) validateHexColor(theme.textColor);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : 'Invalid color format'
      );
    }

    // Get organization settings
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const settings = organization?.settings as any;
    const themeConstraints = settings?.theme?.constraints || {};

    // Check if custom themes are allowed
    if (themeConstraints.allowCustomThemes === false) {
      errors.push('Custom themes are not allowed for this organization');
    }

    // Check allowed color palette
    if (themeConstraints.allowedColors?.length > 0) {
      const allowedColors = themeConstraints.allowedColors as string[];

      if (theme.primaryColor && !allowedColors.includes(theme.primaryColor)) {
        errors.push(
          `Primary color ${theme.primaryColor} is not in allowed palette`
        );
      }

      if (
        theme.secondaryColor &&
        !allowedColors.includes(theme.secondaryColor)
      ) {
        errors.push(
          `Secondary color ${theme.secondaryColor} is not in allowed palette`
        );
      }
    }

    // Check font constraints
    if (themeConstraints.allowedFonts?.length > 0) {
      const allowedFonts = themeConstraints.allowedFonts as string[];

      if (theme.fontFamily && !allowedFonts.includes(theme.fontFamily)) {
        errors.push(`Font ${theme.fontFamily} is not allowed`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all widgets using organization default theme
   */
  async getWidgetsUsingDefaultTheme(organizationId: string) {
    const defaultTheme = await this.getOrganizationDefaultTheme(organizationId);

    const widgets = await prisma.widget.findMany({
      where: {
        company: {
          organizationId,
        },
        AND: [
          { theme: defaultTheme.theme },
          { primaryColor: defaultTheme.primaryColor },
          { secondaryColor: defaultTheme.secondaryColor },
        ],
      },
      select: {
        id: true,
        name: true,
        widgetKey: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return widgets;
  }

  /**
   * Bulk update widgets with organization theme
   */
  async bulkApplyOrganizationTheme(
    organizationId: string,
    widgetIds: string[],
    userId: string
  ) {
    const defaultTheme = await this.getOrganizationDefaultTheme(organizationId);

    // Verify all widgets belong to organization
    const widgets = await prisma.widget.findMany({
      where: {
        id: { in: widgetIds },
        company: {
          organizationId,
        },
      },
    });

    if (widgets.length !== widgetIds.length) {
      throw new Error('Some widgets not found or access denied');
    }

    // Update all widgets
    const updatePromises = widgets.map((widget) =>
      prisma.widget.update({
        where: { id: widget.id },
        data: {
          theme: defaultTheme.theme,
          primaryColor: defaultTheme.primaryColor,
          secondaryColor: defaultTheme.secondaryColor,
          backgroundColor: defaultTheme.backgroundColor,
          textColor: defaultTheme.textColor,
          borderRadius: defaultTheme.borderRadius,
          fontFamily: defaultTheme.fontFamily,
          logoUrl: defaultTheme.logoUrl || widget.logoUrl,
        },
      })
    );

    const updatedWidgets = await Promise.all(updatePromises);

    // Log audit
    await prisma.securityAuditLog.create({
      data: {
        organizationId,
        userId,
        action: 'bulk_theme_applied',
        resource: 'widgets',
        resourceId: widgetIds.join(','),
        success: true,
        details: {
          count: updatedWidgets.length,
          theme: defaultTheme,
        },
      },
    });

    return updatedWidgets;
  }

  /**
   * Get theme usage statistics
   */
  async getThemeUsageStats(organizationId: string) {
    const widgets = await prisma.widget.findMany({
      where: {
        company: {
          organizationId,
        },
      },
      select: {
        theme: true,
        primaryColor: true,
        fontFamily: true,
      },
    });

    const stats = {
      totalWidgets: widgets.length,
      themes: {} as Record<string, number>,
      primaryColors: {} as Record<string, number>,
      fontFamilies: {} as Record<string, number>,
    };

    widgets.forEach((widget) => {
      // Count themes
      stats.themes[widget.theme] = (stats.themes[widget.theme] || 0) + 1;

      // Count primary colors
      stats.primaryColors[widget.primaryColor] =
        (stats.primaryColors[widget.primaryColor] || 0) + 1;

      // Count fonts
      stats.fontFamilies[widget.fontFamily] =
        (stats.fontFamilies[widget.fontFamily] || 0) + 1;
    });

    return stats;
  }

  /**
   * Create theme preset for organization
   */
  async createThemePreset(
    organizationId: string,
    name: string,
    theme: ThemeData,
    userId: string
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    const currentSettings = (organization.settings as any) || {};
    const presets = currentSettings.theme?.presets || [];

    const newPreset = {
      id: `preset_${Date.now()}`,
      name,
      ...theme,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    const updatedSettings = {
      ...currentSettings,
      theme: {
        ...(currentSettings.theme || {}),
        presets: [...presets, newPreset],
      },
    };

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        settings: updatedSettings,
      },
    });

    return newPreset;
  }

  /**
   * Get theme presets for organization
   */
  async getThemePresets(organizationId: string) {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    const settings = organization?.settings as any;
    return settings?.theme?.presets || [];
  }
}

export const themeService = new ThemeService();
