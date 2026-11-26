import { isNetworkError } from '../is-network-error'

describe('isNetworkError', () => {
  it.each([
    [{ status: 'FETCH_ERROR' }, true],
    [{ status: 'TIMEOUT_ERROR' }, true],
    [{ status: 503 }, true],
    [{ status: 500 }, true],
    [{ status: 404 }, false],
    [{ status: 403 }, false],
    [{ status: 401 }, false],
    [{ status: 'PARSING_ERROR' }, false],
    [undefined, false],
    [null, false],
  ])('%p -> %p', (error, expected) => {
    expect(isNetworkError(error)).toBe(expected)
  })
})
