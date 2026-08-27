import '@testing-library/jest-dom'

// Mock env-service
const mockFetchEnvVars = jest.fn()
jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: mockFetchEnvVars,
  clearEnvCache: jest.fn(),
}))

// Mock @reduxjs/toolkit/query/react
const mockApiSlice = {
  reducerPath: 'api',
  reducer: jest.fn(),
  middleware: jest.fn(),
  endpoints: jest.fn(),
}

const mockCreateApi = jest.fn(() => mockApiSlice)
const mockFetchBaseQuery = jest.fn(() => jest.fn())

jest.mock('@reduxjs/toolkit/query/react', () => ({
  createApi: mockCreateApi,
  fetchBaseQuery: mockFetchBaseQuery,
}))

describe('API Slice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    // Mock fetchEnvVars to return /fakeApi
    mockFetchEnvVars.mockResolvedValue({
      REACT_APP_API_BASE_URL: '/fakeApi',
    })
  })

  describe('apiSlice creation', () => {
    it('should create API slice with correct configuration', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalledWith({
        reducerPath: 'api',
        tagTypes: expect.arrayContaining([
          'address_books_settings',
          'general_settings',
          'mail_filters_settings',
          'mail_labels_settings',
          'mail_general_settings',
          'mail_notifications_settings',
          'mail_vacation_settings',
          'mail_forward_settings',
          'address_books',
          'vcard',
          'mail/folders',
          'folder/messages',
          'preferences',
          'mails/folders',
          'adminConfig',
          'adminConfig/domain',
          'adminConfig/rules',
        ]),
        baseQuery: expect.any(Function),
        endpoints: expect.any(Function),
      })
    })

    it('should configure fetchBaseQuery with correct base URL', async () => {
      await import('../api-slice')

      // Get the baseQuery function that was passed to createApi
      const createApiCall = (mockCreateApi.mock.calls as any)[0]
      const baseQueryFn = createApiCall?.[0]?.baseQuery

      expect(baseQueryFn).toBeInstanceOf(Function)

      // Call the dynamic base query function to ensure it fetches env vars
      await baseQueryFn({} as any, {} as any, {} as any)

      expect(mockFetchEnvVars).toHaveBeenCalled()
      expect(mockFetchBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: '/fakeApi',
          timeout: 20_000,
        })
      )
    })

    it('should export apiSlice', async () => {
      const { apiSlice } = await import('../api-slice')

      expect(apiSlice).toBe(mockApiSlice)
    })
  })

  describe('tag types configuration', () => {
    it('should include all required tag types', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const tagTypes = createApiCall?.tagTypes

      const expectedTagTypes = [
        'address_books_settings',
        'general_settings',
        'mail_filters_settings',
        'mail_labels_settings',
        'mail_general_settings',
        'mail_notifications_settings',
        'mail_vacation_settings',
        'mail_forward_settings',
        'address_books',
        'vcard',
        'mail/folders',
        'folder/messages',
        'folder/share',
        'preferences',
        'mails/folders',
        'adminConfig',
        'adminConfig/domain',
        'adminConfig/rules',
        'user_search',
        'contacts_autocomplete',
        'tasks',
        'jobs',
      ]

      expectedTagTypes.forEach((tagType) => {
        expect(tagTypes).toContain(tagType)
      })
    })

    it('should have correct number of tag types', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const tagTypes = createApiCall?.tagTypes

      expect(tagTypes).toHaveLength(39)
    })

    it('should use readonly tag types array', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const tagTypes = createApiCall?.tagTypes

      // Should be an array (readonly arrays are still arrays at runtime)
      expect(Array.isArray(tagTypes)).toBe(true)
    })
  })

  describe('base query configuration', () => {
    it('should use /fakeApi as base URL', async () => {
      await import('../api-slice')

      // Get the baseQuery function that was passed to createApi
      const createApiCall = (mockCreateApi.mock.calls as any)[0]
      const baseQueryFn = createApiCall?.[0]?.baseQuery

      expect(baseQueryFn).toBeInstanceOf(Function)

      // Call the dynamic base query function to test it fetches env and configures baseUrl
      await baseQueryFn({} as any, {} as any, {} as any)

      expect(mockFetchEnvVars).toHaveBeenCalled()
      expect(mockFetchBaseQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          baseUrl: '/fakeApi',
          timeout: 20_000,
        })
      )
    })

    it('should configure base query correctly', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]

      // baseQuery should be the dynamicBaseQuery function
      expect(createApiCall?.baseQuery).toBeInstanceOf(Function)
    })
  })

  describe('endpoints configuration', () => {
    it('should have empty endpoints function', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const endpointsFunction = createApiCall?.endpoints

      expect(typeof endpointsFunction).toBe('function')

      // The endpoints function should return an empty object
      const result = endpointsFunction()
      expect(result).toEqual({})
    })

    it('should be a function that returns empty object', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const endpointsFunction = createApiCall?.endpoints

      expect(endpointsFunction).toBeInstanceOf(Function)
      expect(endpointsFunction()).toEqual({})
    })
  })

  describe('reducer path', () => {
    it('should use "api" as reducer path', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]

      expect(createApiCall?.reducerPath).toBe('api')
    })
  })

  describe('module exports', () => {
    it('should export apiSlice as named export', async () => {
      const module = await import('../api-slice')

      expect(module.apiSlice).toBeDefined()
      expect(module.apiSlice).toBe(mockApiSlice)
    })

    it('should not have default export', async () => {
      const module = await import('../api-slice')

      expect('default' in module).toBe(false)
    })
  })

  describe('API slice properties', () => {
    it('should have expected properties from createApi', async () => {
      const { apiSlice } = await import('../api-slice')

      // The mock returns our mockApiSlice object
      expect(apiSlice.reducerPath).toBe('api')
      expect(apiSlice.reducer).toBeDefined()
      expect(apiSlice.middleware).toBeDefined()
      expect(apiSlice.endpoints).toBeDefined()
    })
  })

  describe('tag types for caching', () => {
    it('should include settings-related tag types', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const tagTypes = createApiCall?.tagTypes

      const settingsTagTypes = [
        'address_books_settings',
        'general_settings',
        'mail_filters_settings',
        'mail_labels_settings',
        'mail_general_settings',
        'mail_notifications_settings',
        'mail_vacation_settings',
        'mail_forward_settings',
      ]

      settingsTagTypes.forEach((tagType) => {
        expect(tagTypes).toContain(tagType)
      })
    })

    it('should include data-related tag types', async () => {
      await import('../api-slice')

      expect(mockCreateApi).toHaveBeenCalled()
      const createApiCall = (mockCreateApi.mock.calls as any)[0]?.[0]
      const tagTypes = createApiCall?.tagTypes

      const dataTagTypes = [
        'address_books',
        'vcard',
        'mail/folders',
        'folder/messages',
        'preferences',
        'mails/folders',
      ]

      dataTagTypes.forEach((tagType) => {
        expect(tagTypes).toContain(tagType)
      })
    })
  })
})
