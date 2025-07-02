import { AxiosInstance } from 'axios'
import { WidgetsAPI } from '../../api/widgets'
import { Widget, CreateWidgetRequest, UpdateWidgetRequest } from '../../types'

describe('WidgetsAPI', () => {
  let widgetsAPI: WidgetsAPI
  let mockAxios: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn()
    } as any

    widgetsAPI = new WidgetsAPI(mockAxios)
  })

  describe('list', () => {
    it('should fetch widgets with pagination', async () => {
      const mockResponse = {
        data: {
          widgets: [
            { id: '1', name: 'Widget 1', widgetKey: 'key-1' },
            { id: '2', name: 'Widget 2', widgetKey: 'key-2' }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1
          }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await widgetsAPI.list({ page: 1, limit: 20 })

      expect(mockAxios.get).toHaveBeenCalledWith('/widgets', { 
        params: { page: 1, limit: 20 } 
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should fetch widgets without pagination params', async () => {
      const mockResponse = {
        data: {
          widgets: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      await widgetsAPI.list()

      expect(mockAxios.get).toHaveBeenCalledWith('/widgets', { params: undefined })
    })
  })

  describe('get', () => {
    it('should fetch a single widget by ID', async () => {
      const widgetId = 'widget-123'
      const mockWidget: Widget = {
        id: widgetId,
        widgetKey: 'key-123',
        name: 'Test Widget',
        companyId: 'company-123',
        isActive: true,
        theme: 'light',
        primaryColor: '#007bff',
        createdAt: '2024-01-01T00:00:00Z'
      }

      mockAxios.get.mockResolvedValue({ data: mockWidget })

      const result = await widgetsAPI.get(widgetId)

      expect(mockAxios.get).toHaveBeenCalledWith(`/widgets/${widgetId}`)
      expect(result).toEqual(mockWidget)
    })
  })

  describe('create', () => {
    it('should create a new widget', async () => {
      const createData: CreateWidgetRequest = {
        name: 'New Widget',
        companyId: 'company-123',
        theme: 'dark',
        primaryColor: '#ffffff'
      }

      const mockWidget: Widget = {
        id: 'new-widget-id',
        widgetKey: 'new-key',
        ...createData,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }

      mockAxios.post.mockResolvedValue({ data: mockWidget })

      const result = await widgetsAPI.create(createData)

      expect(mockAxios.post).toHaveBeenCalledWith('/widgets', createData)
      expect(result).toEqual(mockWidget)
    })
  })

  describe('update', () => {
    it('should update an existing widget', async () => {
      const widgetId = 'widget-123'
      const updateData: UpdateWidgetRequest = {
        name: 'Updated Widget',
        theme: 'auto',
        isActive: false
      }

      const mockWidget: Widget = {
        id: widgetId,
        widgetKey: 'key-123',
        name: 'Updated Widget',
        companyId: 'company-123',
        isActive: false,
        theme: 'auto',
        primaryColor: '#007bff',
        createdAt: '2024-01-01T00:00:00Z'
      }

      mockAxios.put.mockResolvedValue({ data: mockWidget })

      const result = await widgetsAPI.update(widgetId, updateData)

      expect(mockAxios.put).toHaveBeenCalledWith(`/widgets/${widgetId}`, updateData)
      expect(result).toEqual(mockWidget)
    })
  })

  describe('delete', () => {
    it('should delete a widget', async () => {
      const widgetId = 'widget-123'

      mockAxios.delete.mockResolvedValue({ data: {} })

      await widgetsAPI.delete(widgetId)

      expect(mockAxios.delete).toHaveBeenCalledWith(`/widgets/${widgetId}`)
    })
  })

  describe('getByKey', () => {
    it('should fetch a widget by its key', async () => {
      const widgetKey = 'widget-key-123'
      const mockWidget: Widget = {
        id: 'widget-123',
        widgetKey,
        name: 'Test Widget',
        companyId: 'company-123',
        isActive: true,
        theme: 'light',
        primaryColor: '#007bff',
        createdAt: '2024-01-01T00:00:00Z'
      }

      mockAxios.get.mockResolvedValue({ data: mockWidget })

      const result = await widgetsAPI.getByKey(widgetKey)

      expect(mockAxios.get).toHaveBeenCalledWith(`/widgets/key/${widgetKey}`)
      expect(result).toEqual(mockWidget)
    })
  })

  describe('getEmbedCode', () => {
    it('should fetch embed code for a widget', async () => {
      const widgetId = 'widget-123'
      const mockResponse = {
        data: { 
          code: '<script>/* widget code */</script>' 
        }
      }

      mockAxios.get.mockResolvedValue(mockResponse)

      const result = await widgetsAPI.getEmbedCode(widgetId)

      expect(mockAxios.get).toHaveBeenCalledWith(`/widgets/${widgetId}/embed`)
      expect(result).toEqual(mockResponse.data)
    })
  })
})