import { AxiosInstance } from 'axios'
import { Widget, CreateWidgetRequest, UpdateWidgetRequest, PaginationParams, PaginationResponse } from '../types'

export interface WidgetsListResponse {
  widgets: Widget[]
  pagination: PaginationResponse
}

export class WidgetsAPI {
  constructor(private axios: AxiosInstance) {}

  async list(params?: PaginationParams): Promise<WidgetsListResponse> {
    const response = await this.axios.get<WidgetsListResponse>('/widgets', { params })
    return response.data
  }

  async get(widgetId: string): Promise<Widget> {
    const response = await this.axios.get<Widget>(`/widgets/${widgetId}`)
    return response.data
  }

  async create(data: CreateWidgetRequest): Promise<Widget> {
    const response = await this.axios.post<Widget>('/widgets', data)
    return response.data
  }

  async update(widgetId: string, data: UpdateWidgetRequest): Promise<Widget> {
    const response = await this.axios.put<Widget>(`/widgets/${widgetId}`, data)
    return response.data
  }

  async delete(widgetId: string): Promise<void> {
    await this.axios.delete(`/widgets/${widgetId}`)
  }

  async getByKey(widgetKey: string): Promise<Widget> {
    const response = await this.axios.get<Widget>(`/widgets/key/${widgetKey}`)
    return response.data
  }

  async getEmbedCode(widgetId: string): Promise<{ code: string }> {
    const response = await this.axios.get<{ code: string }>(`/widgets/${widgetId}/embed`)
    return response.data
  }
}