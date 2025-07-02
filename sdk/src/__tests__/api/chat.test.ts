import { AxiosInstance } from 'axios'
import { ChatAPI } from '../../api/chat'
import { SendMessageRequest, ChatMessage } from '../../types'

describe('ChatAPI', () => {
  let chatAPI: ChatAPI
  let mockAxios: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    } as any

    chatAPI = new ChatAPI(mockAxios)
  })

  describe('sendMessage', () => {
    it('should send a message and return response', async () => {
      const messageRequest: SendMessageRequest = {
        message: 'Hello, how can I help?',
        widgetKey: 'widget-key-123',
        userId: 'user-123'
      }

      const mockResponse = {
        data: {
          response: 'I can help you with various tasks.',
          messageId: 'msg-123',
          tokens: 25
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await chatAPI.sendMessage(messageRequest)

      expect(mockAxios.post).toHaveBeenCalledWith('/chat', messageRequest)
      expect(result).toEqual(mockResponse.data)
    })

    it('should send a message without userId', async () => {
      const messageRequest: SendMessageRequest = {
        message: 'Hello',
        widgetKey: 'widget-key-123'
      }

      const mockResponse = {
        data: {
          response: 'Hello! How can I assist you?',
          messageId: 'msg-124',
          tokens: 15
        }
      }

      mockAxios.post.mockResolvedValue(mockResponse)

      const result = await chatAPI.sendMessage(messageRequest)

      expect(mockAxios.post).toHaveBeenCalledWith('/chat', messageRequest)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getHistory', () => {
    it('should fetch chat history with pagination', async () => {
      const widgetId = 'widget-123'
      const params = { page: 1, limit: 50 }

      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          question: 'What is your name?',
          answer: 'I am AI Chat Assistant',
          tokens: 20,
          userId: 'user-123',
          widgetId,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]

      const mockResponse = {
        data: {
          messages: mockMessages,
          pagination: {
            page: 1,
            limit: 50,
            total: 1
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await chatAPI.getHistory(widgetId, params)

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/history', {
        params: { widgetId, page: 1, limit: 50 }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch chat history without pagination params', async () => {
      const widgetId = 'widget-123'

      const mockResponse = {
        data: {
          messages: [],
          pagination: undefined
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await chatAPI.getHistory(widgetId)

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/history', {
        params: { widgetId }
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getMessage', () => {
    it('should fetch a specific message by ID', async () => {
      const messageId = 'msg-123'
      
      const mockMessage: ChatMessage = {
        id: messageId,
        question: 'Test question',
        answer: 'Test answer',
        tokens: 30,
        userId: 'user-123',
        widgetId: 'widget-123',
        createdAt: '2024-01-01T00:00:00Z'
      }

      mockAxios.get.mockResolvedValue({ data: mockMessage })

      const result = await chatAPI.getMessage(messageId)

      expect(mockAxios.get).toHaveBeenCalledWith(`/chat/messages/${messageId}`)
      expect(result).toEqual(mockMessage)
    })
  })

  describe('provideFeedback', () => {
    it('should submit positive feedback', async () => {
      const messageId = 'msg-123'
      const feedback = 'positive' as const

      mockAxios.post.mockResolvedValue({ data: {} })

      await chatAPI.provideFeedback(messageId, feedback)

      expect(mockAxios.post).toHaveBeenCalledWith(
        `/chat/messages/${messageId}/feedback`,
        { feedback }
      )
    })

    it('should submit negative feedback', async () => {
      const messageId = 'msg-123'
      const feedback = 'negative' as const

      mockAxios.post.mockResolvedValue({ data: {} })

      await chatAPI.provideFeedback(messageId, feedback)

      expect(mockAxios.post).toHaveBeenCalledWith(
        `/chat/messages/${messageId}/feedback`,
        { feedback }
      )
    })
  })

  describe('exportConversation', () => {
    it('should export conversation as JSON', async () => {
      const widgetId = 'widget-123'
      const format = 'json' as const
      const mockBlob = new Blob(['{"messages": []}'], { type: 'application/json' })

      mockAxios.get.mockResolvedValue({ data: mockBlob })

      const result = await chatAPI.exportConversation(widgetId, format)

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/export', {
        params: { widgetId, format },
        responseType: 'blob'
      })
      expect(result).toEqual(mockBlob)
    })

    it('should export conversation as CSV with default format', async () => {
      const widgetId = 'widget-123'
      const mockBlob = new Blob(['message,response'], { type: 'text/csv' })

      mockAxios.get.mockResolvedValue({ data: mockBlob })

      const result = await chatAPI.exportConversation(widgetId)

      expect(mockAxios.get).toHaveBeenCalledWith('/chat/export', {
        params: { widgetId, format: 'json' },
        responseType: 'blob'
      })
      expect(result).toEqual(mockBlob)
    })
  })
})