import { AxiosInstance } from 'axios'
import { Webhook, CreateWebhookRequest, WebhookLog, PaginationParams } from '../types'

export interface WebhookLogsResponse {
  logs: WebhookLog[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export class WebhooksAPI {
  constructor(private axios: AxiosInstance) {}

  async list(): Promise<Webhook[]> {
    const response = await this.axios.get<Webhook[]>('/webhooks')
    return response.data
  }

  async get(id: string): Promise<Webhook> {
    const response = await this.axios.get<Webhook>(`/webhooks/${id}`)
    return response.data
  }

  async create(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await this.axios.post<Webhook>('/webhooks', data)
    return response.data
  }

  async update(id: string, data: Partial<CreateWebhookRequest>): Promise<Webhook> {
    const response = await this.axios.put<Webhook>(`/webhooks/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/webhooks/${id}`)
  }

  async toggle(id: string, isActive: boolean): Promise<Webhook> {
    const response = await this.axios.patch<Webhook>(`/webhooks/${id}/toggle`, { isActive })
    return response.data
  }

  async getLogs(id: string, params?: PaginationParams): Promise<WebhookLogsResponse> {
    const response = await this.axios.get<WebhookLogsResponse>(`/webhooks/${id}/logs`, { params })
    return response.data
  }

  async testWebhook(id: string): Promise<{ success: boolean; message: string }> {
    const response = await this.axios.post<{ success: boolean; message: string }>(
      `/webhooks/${id}/test`
    )
    return response.data
  }

  async regenerateSecret(id: string): Promise<{ secret: string }> {
    const response = await this.axios.post<{ secret: string }>(`/webhooks/${id}/regenerate-secret`)
    return response.data
  }
}