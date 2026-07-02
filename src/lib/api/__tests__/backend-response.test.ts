import {
  unwrapBackendResponse,
  type BackendResponse,
} from '../backend-response'

describe('backend-response', () => {
  describe('unwrapBackendResponse', () => {
    it('unwraps BackendResponse wrapper', () => {
      const wrapped: BackendResponse<{ id: string }> = {
        data: { id: '1' },
        error_code: 'S000000',
        error_msg: 'No Error',
      }
      expect(unwrapBackendResponse(wrapped)).toEqual({ id: '1' })
    })

    it('returns raw payload when not wrapped', () => {
      const raw = { id: '1' }
      expect(unwrapBackendResponse(raw)).toEqual(raw)
    })
  })
})
