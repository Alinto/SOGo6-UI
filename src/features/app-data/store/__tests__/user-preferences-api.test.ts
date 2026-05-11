import '@testing-library/jest-dom'

/** Holds injectEndpoints config — do not use mock.calls (Jest clearMocks: true wipes them per test). */
let lastInjectConfig: {
  endpoints: (builder: {
    query: (def: unknown) => unknown
    mutation: (def: unknown) => unknown
  }) => Record<string, unknown>
  overrideExisting?: boolean
} | null = null

const mockInjectEndpoints = jest.fn(
  ({
    endpoints,
    ...rest
  }: {
    endpoints: (b: unknown) => Record<string, unknown>
    overrideExisting?: boolean
  }) => {
    lastInjectConfig = { endpoints, ...rest }
    const builder = {
      query: (def: unknown) => def,
      mutation: (def: unknown) => def,
    }
    const endpointDefs = endpoints(
      builder as {
        query: (def: unknown) => unknown
        mutation: (def: unknown) => unknown
      }
    )
    return {
      endpoints: endpointDefs,
      useGetPreferencesQuery: jest.fn(),
      useUpdatePreferencesMutation: jest.fn(),
    }
  }
)

jest.mock('@/lib/redux/api/api-slice', () => ({
  PREFERENCES_SLICE: 'preferences',
  apiSlice: {
    injectEndpoints: mockInjectEndpoints,
  },
}))

function getEndpoints(): {
  getPreferences: {
    query: () => string
    providesTags: string[]
  }
  updatePreferences: {
    query: (body: Record<string, unknown>) => {
      url: string
      method: string
      body: Record<string, unknown>
    }
    invalidatesTags: string[]
  }
} {
  if (!lastInjectConfig) {
    throw new Error('user-preferences-api was not loaded in beforeAll')
  }
  const builder = {
    query: (def: unknown) => def,
    mutation: (def: unknown) => def,
  }
  return lastInjectConfig.endpoints(builder) as ReturnType<typeof getEndpoints>
}

describe('app-data user-preferences-api', () => {
  beforeAll(async () => {
    lastInjectConfig = null
    await import('../user-preferences-api')
  })

  describe('module initialization', () => {
    it('registers endpoints on apiSlice with overrideExisting false', () => {
      expect(lastInjectConfig).toMatchObject({ overrideExisting: false })
    })
  })

  describe('getPreferences', () => {
    it('uses preferences URL for GET', () => {
      const { getPreferences } = getEndpoints()
      expect(typeof getPreferences.query).toBe('function')
      expect(getPreferences.query()).toBe('preferences')
    })

    it('provides preferences tag for cache', () => {
      const { getPreferences } = getEndpoints()
      expect(getPreferences.providesTags).toEqual(['preferences'])
    })
  })

  describe('updatePreferences', () => {
    it('sends PATCH to preferences with body', () => {
      const { updatePreferences } = getEndpoints()
      const body = { theme: 'dark' as const, mailDisplayMode: 'modern' as const }
      expect(updatePreferences.query(body)).toEqual({
        url: 'preferences',
        method: 'PATCH',
        body,
      })
    })

    it('invalidates preferences tag after mutation', () => {
      const { updatePreferences } = getEndpoints()
      expect(updatePreferences.invalidatesTags).toEqual(['preferences'])
    })
  })

  describe('named hook exports', () => {
    it.each([
      ['useGetPreferencesQuery', 'useGetPreferencesQuery'],
      ['useUpdatePreferencesMutation', 'useUpdatePreferencesMutation'],
    ])('exports %s', async (_label, exportName) => {
      const mod = await import('../user-preferences-api')
      const hook = (mod as Record<string, unknown>)[exportName]
      expect(hook).toBeDefined()
      expect(typeof hook).toBe('function')
    })
  })
})
