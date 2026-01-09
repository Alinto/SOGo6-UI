import { VCard } from '@/features/address_books/address-books-types'

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => {
      return {
        json: async () => data,
        status: init?.status ?? 200,
      }
    },
  },
}))

describe('Address Books API Route', () => {
  // Import after mocks
  let GET: () => Promise<{ json: () => Promise<unknown>; status: number }>
  let OPTIONS: () => Promise<{ json: () => Promise<unknown>; status: number }>

  beforeAll(async () => {
    const routeModule = await import('../route')
    GET = routeModule.GET
    OPTIONS = routeModule.OPTIONS
  })
  describe('GET', () => {
    it('should return a list of VCards', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)

      // Verify structure of first item
      if (data.length > 0) {
        const firstItem = data[0] as VCard
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
      const response = await GET()
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)

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
      const response1 = await GET()
      const response2 = await GET()
      const data1 = await response1.json()
      const data2 = await response2.json()

      expect(data1.length).toBe(data2.length)
      expect(data1[0]?.id).toBe(data2[0]?.id)
    })
  })

  describe('OPTIONS', () => {
    it('should return allowed methods', async () => {
      const response = await OPTIONS()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('allow')
      expect(Array.isArray(data.allow)).toBe(true)
      expect(data.allow).toContain('GET')
    })
  })
})
