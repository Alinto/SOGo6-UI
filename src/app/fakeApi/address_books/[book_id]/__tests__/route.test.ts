import { VCard } from '@/features/address_books/address-books-types'
import { NextRequest } from 'next/server'

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status ?? 200,
        cookies: {
          set: jest.fn(),
        },
      }
    },
  },
  NextRequest: class MockNextRequest {
    url = 'http://localhost:3000/api/test'
    cookies = {
      get: jest.fn(() => undefined),
    }
    constructor(url?: string) {
      if (url) this.url = url
    }
  },
}))

describe('Address Books API Route', () => {
  // Import after mocks
  let GET: (
    req: NextRequest,
    context: { params: Promise<{ book_id: string }> }
  ) => Promise<{ json: () => Promise<unknown>; status: number }>
  let POST: (
    req: NextRequest,
    context: { params: Promise<{ book_id: string }> }
  ) => Promise<{ json: () => Promise<unknown>; status: number }>
  let OPTIONS: () => Promise<{ json: () => Promise<unknown>; status: number }>

  const mockRequest = new NextRequest('http://localhost:3000/api/test')
  const mockParams = Promise.resolve({ book_id: 'work' })

  beforeAll(async () => {
    const routeModule = await import('../route')
    GET = routeModule.GET
    POST = routeModule.POST
    OPTIONS = routeModule.OPTIONS
  })

  describe('GET', () => {
    it('should return a list of VCards', async () => {
      const response = await GET(mockRequest, { params: mockParams })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)

      // Verify structure of first item if exists
      if ((data as VCard[]).length > 0) {
        const firstItem = (data as VCard[])[0]
        expect(firstItem).toHaveProperty('id')
        expect(firstItem).toHaveProperty('firstName')
        expect(firstItem).toHaveProperty('lastName')
        expect(firstItem).toHaveProperty('version')
        expect(typeof firstItem.id).toBe('string')
        expect(typeof firstItem.firstName).toBe('string')
        expect(typeof firstItem.lastName).toBe('string')
      }
    })

    it('should return valid VCard structure', async () => {
      const response = await GET(mockRequest, { params: mockParams })
      const data = (await response.json()) as VCard[] // ✅ FIX: Cast directement

      expect(Array.isArray(data)).toBe(true) // ✅ FIX: Pas de (data as VCard[]) après

      data.forEach((item: VCard) => {
        expect(item).toHaveProperty('id')
        expect(item).toHaveProperty('version')
        expect(item).toHaveProperty('firstName')
        expect(item).toHaveProperty('lastName')
        expect(Array.isArray(item.emails)).toBe(true)
        expect(Array.isArray(item.phoneNumbers)).toBe(true)
        expect(Array.isArray(item.addresses)).toBe(true)
      })
    })

    it('should return consistent data structure', async () => {
      const response1 = await GET(mockRequest, { params: mockParams })
      const response2 = await GET(mockRequest, { params: mockParams })
      const data1 = (await response1.json()) as VCard[]
      const data2 = (await response2.json()) as VCard[]

      expect(data1.length).toBe(data2.length)
      if (data1.length > 0) {
        expect(data1[0]?.id).toBe(data2[0]?.id)
      }
    })
  })

  describe('POST', () => {
    it('should create a distribution list with members', async () => {
      const request = {
        json: async () => ({
          kind: 'group',
          firstName: 'Marketing Team',
          members: [
            {
              contactId: '1',
              email: 'john.doe@example.com',
              displayName: 'John Doe',
            },
          ],
        }),
        cookies: { get: jest.fn(() => undefined) },
      } as unknown as NextRequest

      const response = await POST(request, { params: mockParams })
      const data = (await response.json()) as VCard

      expect(response.status).toBe(201)
      expect(data.kind).toBe('group')
      expect(data.firstName).toBe('Marketing Team')
      expect(data.members).toHaveLength(1)
      expect(data.members?.[0]?.email).toBe('john.doe@example.com')
    })
  })

  describe('OPTIONS', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS()
      const data = (await response.json()) as { allow: string[] }

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('allow')
      expect(Array.isArray(data.allow)).toBe(true)
      expect(data.allow).toContain('GET')
    })
  })
})
