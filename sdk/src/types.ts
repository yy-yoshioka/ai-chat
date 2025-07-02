// Common types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

// User types
export interface User {
  id: string
  email: string
  name?: string
  roles: ('owner' | 'org_admin' | 'editor' | 'viewer')[]
  createdAt: string
  updatedAt: string
}

// Organization types
export interface Organization {
  id: string
  name: string
  slug: string
  settings?: Record<string, any>
  createdAt: string
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
  organization: Organization
}

// Widget types
export interface Widget {
  id: string
  widgetKey: string
  name: string
  companyId: string
  isActive: boolean
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  createdAt: string
}

export interface CreateWidgetRequest {
  name: string
  companyId: string
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
}

export interface UpdateWidgetRequest {
  name?: string
  theme?: 'light' | 'dark' | 'auto'
  primaryColor?: string
  isActive?: boolean
}

// Chat types
export interface ChatMessage {
  id: string
  question: string
  answer: string
  tokens: number
  userId?: string
  widgetId: string
  createdAt: string
}

export interface SendMessageRequest {
  message: string
  widgetKey: string
  userId?: string
}

export interface ChatResponse {
  response: string
  messageId: string
  tokens: number
}

// Knowledge Base types
export interface KnowledgeBase {
  id: string
  name: string
  type: 'file' | 'url' | 'text'
  source: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunks?: number
  error?: string
  createdAt: string
}

// Webhook types
export interface Webhook {
  id: string
  name: string
  url: string
  events: ('message.created' | 'user.registered' | 'chat.completed')[]
  isActive: boolean
  retryCount: number
  timeout: number
  secret?: string
  createdAt: string
  updatedAt: string
}

export interface CreateWebhookRequest {
  name: string
  url: string
  events: string[]
  retryCount?: number
  timeout?: number
}

export interface WebhookLog {
  id: string
  webhookId: string
  event: string
  status: 'success' | 'failed'
  statusCode?: number
  error?: string
  createdAt: string
}

// Analytics types
export interface AnalyticsData {
  totalMessages: number
  totalUsers: number
  avgSatisfaction: number
  responseTime: number
  period: string
}