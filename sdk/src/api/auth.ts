import { AxiosInstance } from 'axios'
import { LoginRequest, AuthResponse } from '../types'

export class AuthAPI {
  constructor(private axios: AxiosInstance) {}

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.axios.post<AuthResponse>('/auth/login', data)
    return response.data
  }

  async logout(): Promise<void> {
    await this.axios.post('/auth/logout')
  }

  async getMe(): Promise<AuthResponse> {
    const response = await this.axios.get<AuthResponse>('/auth/me')
    return response.data
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/reset-password', {
      token,
      password
    })
    return response.data
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await this.axios.post<{ message: string }>('/auth/verify-email', { token })
    return response.data
  }
}