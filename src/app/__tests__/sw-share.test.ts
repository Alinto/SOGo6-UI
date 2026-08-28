import { isShareTargetRequest } from '../sw-share'

describe('isShareTargetRequest', () => {
  it('matches POST /en/share', () => {
    expect(
      isShareTargetRequest({
        method: 'POST',
        url: 'https://sogo.example/en/share',
      })
    ).toBe(true)
  })

  it('ignores GET and other paths', () => {
    expect(
      isShareTargetRequest({
        method: 'GET',
        url: 'https://sogo.example/en/share',
      })
    ).toBe(false)
    expect(
      isShareTargetRequest({
        method: 'POST',
        url: 'https://sogo.example/en/u/0/INBOX',
      })
    ).toBe(false)
  })
})
