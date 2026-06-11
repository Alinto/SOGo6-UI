import { NextRequest } from 'next/server'

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
  NextRequest: class MockNextRequest {
    url = 'http://localhost:3000/api/test'
    constructor(url?: string) {
      if (url) this.url = url
    }
  },
}))

describe('Mail Reply API Route', () => {
  let GET: (
    req: NextRequest,
    ctx: {
      params: Promise<{ accountId: string; folder: string; mailId: string }>
    }
  ) => Promise<{ json: () => Promise<unknown>; status: number }>
  let OPTIONS: () => Promise<{ json: () => Promise<unknown>; status: number }>

  const mockRequest = new NextRequest('http://localhost:3000/api/test')

  beforeAll(async () => {
    const routeModule = await import('../route')
    GET = routeModule.GET
    OPTIONS = routeModule.OPTIONS
  })

  describe('GET', () => {
    it('returns the mail data with a reply key when the mail exists', async () => {
      const response = await GET(mockRequest, {
        params: Promise.resolve({
          accountId: '0',
          folder: 'INBOX',
          mailId: 'inbox_001',
        }),
      })
      const body = (await response.json()) as {
        data: { id: string; subject: string; key: string }
        error_code: string
        error_msg: string
      }

      expect(response.status).toBe(200)
      expect(body.error_code).toBe('S000000')
      expect(body.data.id).toBe('inbox_001')
      expect(body.data.subject).toBe('Entretien candidat — poste développeur')
      expect(body.data.key).toBe('reply-inbox_001')
    })

    it('normalizes the from/to fields like the mail detail route', async () => {
      const response = await GET(mockRequest, {
        params: Promise.resolve({
          accountId: '0',
          folder: 'INBOX',
          mailId: 'inbox_001',
        }),
      })
      const body = (await response.json()) as {
        data: {
          from: { name: string; email: string }
          to: { name: string; email: string }[]
        }
      }

      expect(body.data.from).toEqual({
        name: 'David Gueto',
        email: 'dgueto@gmail.com',
      })
      expect(body.data.to).toEqual([
        { name: 'John Paul', email: 'sogo-tests1@example.org' },
      ])
    })

    it('returns a 404 envelope when the mail does not exist', async () => {
      const response = await GET(mockRequest, {
        params: Promise.resolve({
          accountId: '0',
          folder: 'INBOX',
          mailId: 'does-not-exist',
        }),
      })
      const body = (await response.json()) as {
        data: null
        error_code: string
        error_msg: string
      }

      expect(response.status).toBe(404)
      expect(body.data).toBeNull()
      expect(body.error_code).toBe('S000300')
    })

    it('returns a 404 envelope for an unknown folder', async () => {
      const response = await GET(mockRequest, {
        params: Promise.resolve({
          accountId: '0',
          folder: 'UNKNOWN_FOLDER',
          mailId: 'inbox_001',
        }),
      })

      expect(response.status).toBe(404)
    })
  })

  describe('OPTIONS', () => {
    it('returns the allowed methods', async () => {
      const response = await OPTIONS()
      const data = (await response.json()) as { allow: string[] }

      expect(response.status).toBe(200)
      expect(data.allow).toEqual(['GET', 'OPTIONS'])
    })
  })
})
