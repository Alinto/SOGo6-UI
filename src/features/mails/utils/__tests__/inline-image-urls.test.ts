import {
  fetchInlineImageDisplayUrls,
  inlineImageFetchTargets,
} from '../inline-image-urls'

describe('inlineImageFetchTargets', () => {
  const parts = [
    { name: 'logo.png', contentId: 'logo.png' },
    { name: 'show.png', contentId: 'show.png@cleanmail.eu' },
    { name: 'notes.pdf', contentId: 'notes.pdf' },
  ]
  const attachmentsUrl = 'mailboxes/default/folders/INBOX/mails/42/attachments/'

  it('lists each referenced cid image once', () => {
    const targets = inlineImageFetchTargets(
      '<img src="cid:logo.png"><img src="cid:show.png"><img src="cid:logo.png">',
      parts,
      attachmentsUrl
    )
    expect(targets.map((target) => target.name)).toEqual([
      'logo.png',
      'show.png',
    ])
    expect(targets[0]?.url).toContain('attachments/logo.png')
    expect(targets[1]?.url).toContain('attachments/show.png')
  })

  it('ignores attachments that the html does not reference', () => {
    const targets = inlineImageFetchTargets(
      '<p>no image</p>',
      parts,
      attachmentsUrl
    )
    expect(targets).toEqual([])
  })
})

describe('fetchInlineImageDisplayUrls', () => {
  const originalFetch = global.fetch
  const originalCreate = URL.createObjectURL

  afterEach(() => {
    global.fetch = originalFetch
    URL.createObjectURL = originalCreate
  })

  it('sends the bearer token and returns a blob url', async () => {
    URL.createObjectURL = jest.fn(() => 'blob:logo')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['png'], { type: 'image/png' }),
    }) as typeof fetch

    const urls = await fetchInlineImageDisplayUrls(
      [{ name: 'logo.png', url: 'https://mail.example/logo.png' }],
      'session-token',
      'blob'
    )

    expect(global.fetch).toHaveBeenCalledWith('https://mail.example/logo.png', {
      headers: { Authorization: 'Bearer session-token' },
    })
    expect(urls).toEqual({ 'logo.png': 'blob:logo' })
  })

  it('skips an image the server refuses', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as typeof fetch

    const urls = await fetchInlineImageDisplayUrls(
      [{ name: 'logo.png', url: 'https://mail.example/logo.png' }],
      null,
      'blob'
    )

    expect(urls).toEqual({})
  })
})
