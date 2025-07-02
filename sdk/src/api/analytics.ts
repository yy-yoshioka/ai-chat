import { AxiosInstance } from 'axios'
import { AnalyticsData } from '../types'

export interface ConversationFlow {
  nodes: Array<{
    id: string
    label: string
    count: number
  }>
  edges: Array<{
    source: string
    target: string
    count: number
  }>
}

export interface UnresolvedQuestion {
  question: string
  count: number
  lastAsked: string
}

export interface DetailedAnalytics extends AnalyticsData {
  topQuestions: Array<{
    question: string
    count: number
  }>
  userSatisfaction: {
    positive: number
    negative: number
    neutral: number
  }
  peakHours: Array<{
    hour: number
    count: number
  }>
}

export class AnalyticsAPI {
  constructor(private axios: AxiosInstance) {}

  async get(period: '24h' | '7d' | '30d' = '7d', widgetId?: string): Promise<AnalyticsData> {
    const response = await this.axios.get<AnalyticsData>('/analytics', {
      params: { period, widgetId }
    })
    return response.data
  }

  async getDetailed(period: '24h' | '7d' | '30d' = '7d', widgetId?: string): Promise<DetailedAnalytics> {
    const response = await this.axios.get<DetailedAnalytics>('/analytics/detailed', {
      params: { period, widgetId }
    })
    return response.data
  }

  async getConversationFlow(widgetId: string, period: '24h' | '7d' | '30d' = '7d'): Promise<ConversationFlow> {
    const response = await this.axios.get<ConversationFlow>('/analytics/conversation-flow', {
      params: { widgetId, period }
    })
    return response.data
  }

  async getUnresolvedQuestions(
    widgetId?: string,
    limit: number = 20
  ): Promise<UnresolvedQuestion[]> {
    const response = await this.axios.get<UnresolvedQuestion[]>('/analytics/unresolved', {
      params: { widgetId, limit }
    })
    return response.data
  }

  async exportReport(
    format: 'pdf' | 'csv' | 'json',
    period: '24h' | '7d' | '30d' = '7d',
    widgetId?: string
  ): Promise<Blob> {
    const response = await this.axios.get('/analytics/export', {
      params: { format, period, widgetId },
      responseType: 'blob'
    })
    return response.data
  }

  async getUsageMetrics(organizationId?: string): Promise<{
    messagesUsed: number
    messagesLimit: number
    storageUsed: number
    storageLimit: number
    period: string
  }> {
    const response = await this.axios.get('/analytics/usage', {
      params: { organizationId }
    })
    return response.data
  }
}