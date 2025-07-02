import { AxiosInstance } from 'axios'
import { AuthAPI } from '../../api/auth'

describe('AuthAPI', () => {
  let authAPI: AuthAPI
  let mockAxios: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    } as any

    authAPI = new AuthAPI(mockAxios)
  })

  describe('login', () => {
    it('should send login request with credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: '123', email: loginData.email },
          organization: { id: 'org-123', name: 'Test Org' }
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.login(loginData)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/login', loginData)
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login error', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password'
      }

      mockAxios.post.mockRejectedValue(new Error('Invalid credentials'))

      await expect(authAPI.login(loginData)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('should send logout request', async () => {
      mockAxios.post.mockResolvedValue({ data: {} })

      await authAPI.logout()

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/logout')
    })
  })

  describe('getMe', () => {
    it('should fetch current user information', async () => {
      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: '123', email: 'test@example.com' },
          organization: { id: 'org-123', name: 'Test Org' }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await authAPI.getMe()

      expect(mockAxios.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      const email = 'test@example.com'
      const mockResponse = {
        data: { message: 'Password reset email sent' }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.forgotPassword(email)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/forgot-password', { email })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resetPassword', () => {
    it('should send reset password request', async () => {
      const token = 'reset-token'
      const password = 'new-password123'
      const mockResponse = {
        data: { message: 'Password reset successful' }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.resetPassword(token, password)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/reset-password', { token, password })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('verifyEmail', () => {
    it('should send email verification request', async () => {
      const token = 'verify-token'
      const mockResponse = {
        data: { message: 'Email verified successfully' }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await authAPI.verifyEmail(token)

      expect(mockAxios.post).toHaveBeenCalledWith('/auth/verify-email', { token })
      expect(result).toEqual(mockResponse.data)
    })
  })
})