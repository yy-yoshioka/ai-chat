import AIChatSDK from '../index'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('AIChatSDK', () => {
  let client: AIChatSDK
  const mockApiKey = 'test-api-key'
  const mockBaseURL = 'https://api.test.com'

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock axios.create
    const mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    }
    
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any)
    
    client = new AIChatSDK({
      apiKey: mockApiKey,
      baseURL: mockBaseURL
    })
  })

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: mockBaseURL,
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${mockApiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Chat-SDK/1.0.0'
        }
      })
    })

    it('should use default baseURL if not provided', () => {
      mockedAxios.create.mockClear()
      new AIChatSDK({ apiKey: mockApiKey })
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.ai-chat.com/v1'
        })
      )
    })

    it('should use custom timeout if provided', () => {
      mockedAxios.create.mockClear()
      new AIChatSDK({ 
        apiKey: mockApiKey, 
        timeout: 60000 
      })
      
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 60000
        })
      )
    })
  })

  describe('convenience methods', () => {
    let mockChatPost: jest.Mock
    let mockWidgetsPost: jest.Mock
    let mockKnowledgeBaseUpload: jest.Mock
    let mockAnalyticsGet: jest.Mock

    beforeEach(() => {
      mockChatPost = jest.fn().mockResolvedValue({ 
        data: { response: 'Hello!', messageId: '123', tokens: 10 } 
      })
      mockWidgetsPost = jest.fn().mockResolvedValue({ 
        data: { id: 'widget-123', name: 'Test Widget' } 
      })
      mockKnowledgeBaseUpload = jest.fn().mockResolvedValue({ 
        data: { id: 'kb-123', status: 'processing' } 
      })
      mockAnalyticsGet = jest.fn().mockResolvedValue({ 
        data: { totalMessages: 100, totalUsers: 50 } 
      })

      // Mock the API methods
      client.chat.sendMessage = mockChatPost
      client.widgets.create = mockWidgetsPost
      client.knowledgeBase.upload = mockKnowledgeBaseUpload
      client.analytics.get = mockAnalyticsGet
    })

    describe('sendMessage', () => {
      it('should call chat.sendMessage with correct parameters', async () => {
        const widgetKey = 'test-widget'
        const message = 'Hello world'
        const userId = 'user-123'

        await client.sendMessage(widgetKey, message, userId)

        expect(mockChatPost).toHaveBeenCalledWith({
          message,
          widgetKey,
          userId
        })
      })

      it('should work without userId', async () => {
        const widgetKey = 'test-widget'
        const message = 'Hello world'

        await client.sendMessage(widgetKey, message)

        expect(mockChatPost).toHaveBeenCalledWith({
          message,
          widgetKey,
          userId: undefined
        })
      })
    })

    describe('createWidget', () => {
      it('should call widgets.create with provided data', async () => {
        const widgetData = {
          name: 'Test Widget',
          companyId: 'company-123',
          theme: 'light' as const,
          primaryColor: '#007bff'
        }

        await client.createWidget(widgetData)

        expect(mockWidgetsPost).toHaveBeenCalledWith(widgetData)
      })
    })

    describe('uploadKnowledgeBase', () => {
      it('should create FormData and call knowledgeBase.upload', async () => {
        const file = Buffer.from('test content')
        const name = 'test.txt'

        await client.uploadKnowledgeBase(file, name)

        expect(mockKnowledgeBaseUpload).toHaveBeenCalled()
        const formData = mockKnowledgeBaseUpload.mock.calls[0][0]
        expect(formData).toBeInstanceOf(FormData)
      })
    })

    describe('getAnalytics', () => {
      it('should call analytics.get with default period', async () => {
        const widgetId = 'widget-123'

        await client.getAnalytics()

        expect(mockAnalyticsGet).toHaveBeenCalledWith('7d', undefined)
      })

      it('should call analytics.get with custom period and widgetId', async () => {
        const widgetId = 'widget-123'
        const period = '30d' as const

        await client.getAnalytics(period, widgetId)

        expect(mockAnalyticsGet).toHaveBeenCalledWith(period, widgetId)
      })
    })
  })

  describe('API instances', () => {
    it('should have all API instances initialized', () => {
      expect(client.auth).toBeDefined()
      expect(client.widgets).toBeDefined()
      expect(client.chat).toBeDefined()
      expect(client.knowledgeBase).toBeDefined()
      expect(client.webhooks).toBeDefined()
      expect(client.analytics).toBeDefined()
    })
  })
})