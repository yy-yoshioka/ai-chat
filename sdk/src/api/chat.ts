import { AxiosInstance } from 'axios'
import { ChatMessage, SendMessageRequest, ChatResponse, PaginationParams } from '../types'

export interface ChatHistoryResponse {
  messages: ChatMessage[]
  pagination?: {
    page: number
    limit: number
    total: number
  }
}

export class ChatAPI {
  constructor(private axios: AxiosInstance) {}

  async sendMessage(data: SendMessageRequest): Promise<ChatResponse> {
    const response = await this.axios.post<ChatResponse>('/chat', data)
    return response.data
  }

  async getHistory(widgetId: string, params?: PaginationParams): Promise<ChatHistoryResponse> {
    const response = await this.axios.get<ChatHistoryResponse>('/chat/history', {
      params: { widgetId, ...params }
    })
    return response.data
  }

  async getMessage(messageId: string): Promise<ChatMessage> {
    const response = await this.axios.get<ChatMessage>(`/chat/messages/${messageId}`)
    return response.data
  }

  async provideFeedback(messageId: string, feedback: 'positive' | 'negative'): Promise<void> {
    await this.axios.post(`/chat/messages/${messageId}/feedback`, { feedback })
  }

  async exportConversation(widgetId: string, format: 'csv' | 'json' = 'json'): Promise<Blob> {
    const response = await this.axios.get(`/chat/export`, {
      params: { widgetId, format },
      responseType: 'blob'
    })
    return response.data
  }
}