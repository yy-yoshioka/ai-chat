import { AxiosInstance } from 'axios'
import { KnowledgeBase } from '../types'

export class KnowledgeBaseAPI {
  constructor(private axios: AxiosInstance) {}

  async list(): Promise<KnowledgeBase[]> {
    const response = await this.axios.get<KnowledgeBase[]>('/knowledge-base')
    return response.data
  }

  async get(id: string): Promise<KnowledgeBase> {
    const response = await this.axios.get<KnowledgeBase>(`/knowledge-base/${id}`)
    return response.data
  }

  async upload(formData: FormData): Promise<KnowledgeBase> {
    const response = await this.axios.post<KnowledgeBase>('/knowledge-base', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async uploadFromURL(url: string, name: string): Promise<KnowledgeBase> {
    const response = await this.axios.post<KnowledgeBase>('/knowledge-base/url', {
      url,
      name,
      type: 'url'
    })
    return response.data
  }

  async uploadText(text: string, name: string): Promise<KnowledgeBase> {
    const response = await this.axios.post<KnowledgeBase>('/knowledge-base/text', {
      text,
      name,
      type: 'text'
    })
    return response.data
  }

  async delete(id: string): Promise<void> {
    await this.axios.delete(`/knowledge-base/${id}`)
  }

  async reprocess(id: string): Promise<KnowledgeBase> {
    const response = await this.axios.post<KnowledgeBase>(`/knowledge-base/${id}/reprocess`)
    return response.data
  }

  async getStatus(id: string): Promise<{ status: string; progress?: number }> {
    const response = await this.axios.get<{ status: string; progress?: number }>(
      `/knowledge-base/${id}/status`
    )
    return response.data
  }
}