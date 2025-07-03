import { prisma } from '@shared/database/prisma';
import { CustomResponse, ResponseType, Prisma } from '@prisma/client';
import { logger } from '@shared/logger';

export interface CreateCustomResponseInput {
  organizationId: string;
  name: string;
  type: ResponseType;
  content: string;
  metadata?: Record<string, unknown>;
  priority?: number;
  conditions?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateCustomResponseInput {
  name?: string;
  type?: ResponseType;
  content?: string;
  metadata?: Record<string, unknown>;
  priority?: number;
  conditions?: Record<string, unknown>;
  isActive?: boolean;
}

export interface WidgetResponseOverride {
  widgetId: string;
  customResponseId: string;
  isEnabled?: boolean;
  overrideContent?: string;
}

export class CustomResponseService {
  /**
   * Create a new custom response template
   */
  async createCustomResponse(
    input: CreateCustomResponseInput
  ): Promise<CustomResponse> {
    return prisma.customResponse.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        type: input.type,
        content: input.content,
        metadata: input.metadata as Prisma.InputJsonValue,
        priority: input.priority || 0,
        conditions: input.conditions as Prisma.InputJsonValue,
        isActive: input.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing custom response
   */
  async updateCustomResponse(
    id: string,
    organizationId: string,
    input: UpdateCustomResponseInput
  ): Promise<CustomResponse> {
    // Verify ownership
    const response = await prisma.customResponse.findFirst({
      where: { id, organizationId },
    });

    if (!response) {
      throw new Error('Custom response not found or access denied');
    }

    const updateData: Prisma.CustomResponseUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata as Prisma.InputJsonValue;
    }
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.conditions !== undefined) {
      updateData.conditions = input.conditions as Prisma.InputJsonValue;
    }
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    return prisma.customResponse.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a custom response
   */
  async deleteCustomResponse(
    id: string,
    organizationId: string
  ): Promise<void> {
    // Verify ownership
    const response = await prisma.customResponse.findFirst({
      where: { id, organizationId },
    });

    if (!response) {
      throw new Error('Custom response not found or access denied');
    }

    await prisma.customResponse.delete({
      where: { id },
    });
  }

  /**
   * Get all custom responses for an organization
   */
  async getOrganizationResponses(
    organizationId: string,
    type?: ResponseType,
    isActive?: boolean
  ): Promise<CustomResponse[]> {
    const where: Prisma.CustomResponseWhereInput = {
      organizationId,
    };

    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    return prisma.customResponse.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Get a single custom response
   */
  async getCustomResponse(
    id: string,
    organizationId: string
  ): Promise<CustomResponse | null> {
    return prisma.customResponse.findFirst({
      where: { id, organizationId },
      include: {
        widgets: {
          include: {
            widget: true,
          },
        },
      },
    });
  }

  /**
   * Associate a custom response with a widget
   */
  async addResponseToWidget(override: WidgetResponseOverride): Promise<void> {
    await prisma.widgetCustomResponse.create({
      data: {
        widgetId: override.widgetId,
        customResponseId: override.customResponseId,
        isEnabled: override.isEnabled ?? true,
        overrideContent: override.overrideContent,
      },
    });
  }

  /**
   * Update widget-specific response override
   */
  async updateWidgetResponse(
    widgetId: string,
    customResponseId: string,
    update: {
      isEnabled?: boolean;
      overrideContent?: string | null;
    }
  ): Promise<void> {
    await prisma.widgetCustomResponse.update({
      where: {
        widgetId_customResponseId: {
          widgetId,
          customResponseId,
        },
      },
      data: update,
    });
  }

  /**
   * Remove a custom response from a widget
   */
  async removeResponseFromWidget(
    widgetId: string,
    customResponseId: string
  ): Promise<void> {
    await prisma.widgetCustomResponse.delete({
      where: {
        widgetId_customResponseId: {
          widgetId,
          customResponseId,
        },
      },
    });
  }

  /**
   * Get all custom responses for a widget
   */
  async getWidgetResponses(
    widgetId: string,
    type?: ResponseType
  ): Promise<
    Array<{
      customResponse: CustomResponse;
      isEnabled: boolean;
      overrideContent: string | null;
    }>
  > {
    const widget = await prisma.widget.findUnique({
      where: { id: widgetId },
      include: {
        customResponses: {
          include: {
            customResponse: true,
          },
          where: {
            isEnabled: true,
            ...(type && {
              customResponse: {
                type,
                isActive: true,
              },
            }),
          },
        },
        company: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!widget) {
      return [];
    }

    // Get organization-level responses
    const orgResponses = await this.getOrganizationResponses(
      widget.company.organizationId,
      type,
      true
    );

    // Merge widget-specific and organization responses
    const widgetResponseMap = new Map(
      widget.customResponses.map((wcr) => [
        wcr.customResponseId,
        {
          customResponse: wcr.customResponse,
          isEnabled: wcr.isEnabled,
          overrideContent: wcr.overrideContent,
        },
      ])
    );

    // Add organization responses that aren't widget-specific
    const allResponses = [
      ...widgetResponseMap.values(),
      ...orgResponses
        .filter((r) => !widgetResponseMap.has(r.id))
        .map((r) => ({
          customResponse: r,
          isEnabled: true,
          overrideContent: null,
        })),
    ];

    // Sort by priority
    return allResponses.sort(
      (a, b) => b.customResponse.priority - a.customResponse.priority
    );
  }

  /**
   * Get the appropriate response for a given context
   */
  async getResponseForContext(
    widgetId: string,
    type: ResponseType,
    context?: Record<string, unknown>
  ): Promise<string | null> {
    const responses = await this.getWidgetResponses(widgetId, type);

    for (const { customResponse, overrideContent } of responses) {
      // Check conditions if any
      if (customResponse.conditions) {
        const conditions = customResponse.conditions as Record<string, unknown>;
        if (!this.evaluateConditions(conditions, context)) {
          continue;
        }
      }

      // Use override content if available, otherwise use default
      const content = overrideContent || customResponse.content;

      // Replace variables in content
      return this.interpolateVariables(content, context);
    }

    return null;
  }

  /**
   * Evaluate conditions against context
   */
  private evaluateConditions(
    conditions: Record<string, unknown>,
    context?: Record<string, unknown>
  ): boolean {
    if (!context) return false;

    // Simple condition evaluation - can be enhanced
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Replace variables in content with context values
   */
  private interpolateVariables(
    content: string,
    context?: Record<string, unknown>
  ): string {
    if (!context) return content;

    return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(context[key] || match);
    });
  }

  /**
   * Create default responses for an organization
   */
  async createDefaultResponses(organizationId: string): Promise<void> {
    const defaultResponses: CreateCustomResponseInput[] = [
      {
        organizationId,
        name: 'Default Greeting',
        type: ResponseType.GREETING,
        content: 'Hello! How can I assist you today?',
        priority: 0,
      },
      {
        organizationId,
        name: 'Default Fallback',
        type: ResponseType.FALLBACK,
        content:
          "I'm sorry, I don't have information about that. Could you please rephrase your question or ask something else?",
        priority: 0,
      },
      {
        organizationId,
        name: 'Default Error',
        type: ResponseType.ERROR,
        content:
          "I apologize, but I'm experiencing technical difficulties. Please try again later.",
        priority: 0,
      },
      {
        organizationId,
        name: 'Default Rate Limit',
        type: ResponseType.RATE_LIMIT,
        content:
          "You've reached the maximum number of messages. Please wait a moment before sending another message.",
        priority: 0,
      },
      {
        organizationId,
        name: 'Default Maintenance',
        type: ResponseType.MAINTENANCE,
        content:
          "We're currently performing maintenance. Please check back later.",
        priority: 0,
      },
    ];

    try {
      await prisma.customResponse.createMany({
        data: defaultResponses,
        skipDuplicates: true,
      });
      logger.info('Created default custom responses', { organizationId });
    } catch (error) {
      logger.error('Failed to create default responses', {
        organizationId,
        error,
      });
    }
  }
}

export const customResponseService = new CustomResponseService();
