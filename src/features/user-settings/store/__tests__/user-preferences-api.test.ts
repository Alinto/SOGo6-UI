import { userPreferencesApi } from '../user-preferences-api'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockPatchPreferencesOnQueryStarted = jest.fn()

jest.mock('@/features/notifications/api-notification-handler', () => ({
  createApiNotificationHandler: jest.fn(
    () => mockPatchPreferencesOnQueryStarted
  ),
}))

// Mock apiSlice
const mockInjectEndpoints = jest.fn(() => ({
  endpoints: {},
  useLoginMutation: jest.fn(),
  useGetAuthModeQuery: jest.fn(),
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    injectEndpoints: mockInjectEndpoints,
  },
}))
const mockQuery = jest.fn()
const mockMutation = jest.fn()

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    injectEndpoints: jest.fn(({ endpoints }) => {
      const builder = {
        query: (def: any) => ({ type: 'query', ...def }),
        mutation: (def: any) => ({ type: 'mutation', ...def }),
      }
      const endpointDefs = endpoints(builder)
      return {
        endpoints: endpointDefs,
        // Simulate RTK Query hook exports
        useGetUserPreferencesQuery: jest.fn(),
        useLazyGetUserPreferencesQuery: jest.fn(),
        useUpdateUserPreferencesGeneralMutation: jest.fn(),
        useUpdateUserPreferencesContactMutation: jest.fn(),
        useUpdateUserPreferencesMailGeneralMutation: jest.fn(),
        useUpdateUserPreferencesMailCategoryMutation: jest.fn(),
        useUpdateUserPreferencesCalendarGeneralMutation: jest.fn(),
        useUpdateUserPreferencesCalendarCategoryMutation: jest.fn(),
        useUpdateUserPreferencesSecurityMutation: jest.fn(),
      }
    }),
  },
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function getEndpoints() {
  const { apiSlice } = require('@/lib/redux/api/api-slice')
  const call = apiSlice.injectEndpoints.mock.calls[0][0]
  const builder = {
    query: (def: any) => def,
    mutation: (def: any) => def,
  }
  return call.endpoints(builder)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('userPreferencesApi', () => {
  // ── module initialization ─────────────────────────────────────────────────

  describe('module initialization', () => {
    it('exports userPreferencesApi', () => {
      expect(userPreferencesApi).toBeDefined()
    })
  })

  // ── named hook exports ────────────────────────────────────────────────────

  describe('named hook exports', () => {
    const {
      useGetUserPreferencesQuery,
      useLazyGetUserPreferencesQuery,
      useUpdateUserPreferencesGeneralMutation,
      useUpdateUserPreferencesContactMutation,
      useUpdateUserPreferencesMailGeneralMutation,
      useUpdateUserPreferencesMailCategoryMutation,
      useUpdateUserPreferencesCalendarGeneralMutation,
      useUpdateUserPreferencesCalendarCategoryMutation,
      useUpdateUserPreferencesSecurityMutation,
    } = require('../user-preferences-api')

    it.each([
      ['useGetUserPreferencesQuery', useGetUserPreferencesQuery],
      ['useLazyGetUserPreferencesQuery', useLazyGetUserPreferencesQuery],
      [
        'useUpdateUserPreferencesGeneralMutation',
        useUpdateUserPreferencesGeneralMutation,
      ],
      [
        'useUpdateUserPreferencesContactMutation',
        useUpdateUserPreferencesContactMutation,
      ],
      [
        'useUpdateUserPreferencesMailGeneralMutation',
        useUpdateUserPreferencesMailGeneralMutation,
      ],
      [
        'useUpdateUserPreferencesMailCategoryMutation',
        useUpdateUserPreferencesMailCategoryMutation,
      ],
      [
        'useUpdateUserPreferencesCalendarGeneralMutation',
        useUpdateUserPreferencesCalendarGeneralMutation,
      ],
      [
        'useUpdateUserPreferencesCalendarCategoryMutation',
        useUpdateUserPreferencesCalendarCategoryMutation,
      ],
      [
        'useUpdateUserPreferencesSecurityMutation',
        useUpdateUserPreferencesSecurityMutation,
      ],
    ])('exports %s', (name, hook) => {
      expect(hook).toBeDefined()
    })
  })
})
