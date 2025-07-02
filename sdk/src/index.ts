import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AuthAPI } from './api/auth'
import { WidgetsAPI } from './api/widgets'
import { ChatAPI } from './api/chat'
import { KnowledgeBaseAPI } from './api/knowledge-base'
import { WebhooksAPI } from './api/webhooks'
import { AnalyticsAPI } from './api/analytics'

export interface AIChatSDKConfig {
  apiKey: string
  baseURL?: string
  timeout?: number
}

export interface APIError {
  error: string
  message: string
  details?: any[]
}

export class AIChatSDK {
  private axiosInstance: AxiosInstance
  
  // API instances
  public auth: AuthAPI
  public widgets: WidgetsAPI
  public chat: ChatAPI
  public knowledgeBase: KnowledgeBaseAPI
  public webhooks: WebhooksAPI
  public analytics: AnalyticsAPI

  constructor(config: AIChatSDKConfig) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'https://api.ai-chat.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'AI-Chat-SDK/1.0.0'
      }
    })

    // Add request interceptor for debugging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const apiError: APIError = error.response.data
          throw new Error(`API Error ${error.response.status}: ${apiError.message || error.message}`)
        } else if (error.request) {
          throw new Error('Network error: No response received from server')
        } else {
          throw new Error(`Request error: ${error.message}`)
        }
      }
    )

    // Initialize API instances
    this.auth = new AuthAPI(this.axiosInstance)
    this.widgets = new WidgetsAPI(this.axiosInstance)
    this.chat = new ChatAPI(this.axiosInstance)
    this.knowledgeBase = new KnowledgeBaseAPI(this.axiosInstance)
    this.webhooks = new WebhooksAPI(this.axiosInstance)
    this.analytics = new AnalyticsAPI(this.axiosInstance)
  }

  // Convenience methods
  async sendMessage(widgetKey: string, message: string, userId?: string) {
    return this.chat.sendMessage({
      message,
      widgetKey,
      userId
    })
  }

  async createWidget(data: {
    name: string
    companyId: string
    theme?: 'light' | 'dark' | 'auto'
    primaryColor?: string
  }) {
    return this.widgets.create(data)
  }

  async uploadKnowledgeBase(file: File | Buffer, name: string) {
    const formData = new FormData()
    formData.append('file', file as any)
    formData.append('name', name)
    formData.append('type', 'file')

    return this.knowledgeBase.upload(formData)
  }

  async getAnalytics(period: '24h' | '7d' | '30d' = '7d', widgetId?: string) {
    return this.analytics.get(period, widgetId)
  }
}

export default AIChatSDK

// Export types
export * from './types'