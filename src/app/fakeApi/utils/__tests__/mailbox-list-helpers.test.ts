import { buildMailSearchResponse } from '@/app/fakeApi/utils/mailbox-list-helpers'
import type { MailSearchParams } from '@/features/mails/mails-types'

const search = (body: MailSearchParams, query = 'page_size=100') =>
  buildMailSearchResponse(body, new URLSearchParams(query))

const ids = (body: MailSearchParams) => search(body).mails.map((m) => m.id)

describe('buildMailSearchResponse', () => {
  it('handles the simple search body (OR of subject and sender)', () => {
    const result = ids({
      subject: 'gueto',
      from: ['gueto'],
      operator: 'OR',
      folders: ['INBOX'],
      include_subfolders: false,
    })

    expect(result).toEqual(['inbox_001'])
  })

  it('matches any of several from values', () => {
    const result = ids({
      from: ['dgueto@gmail.com', 'james.wilson'],
      folders: ['all'],
    })

    expect(result.sort()).toEqual(['inbox_001', 'inbox_002'])
  })

  it('matches to against Cc recipients', () => {
    expect(ids({ to: ['ops@partner.io'], folders: ['all'] })).toEqual([
      'inbox_003',
    ])
  })

  it('matches bcc recipients from the detail seed', () => {
    expect(ids({ bcc: ['direction@sogomail.eu'], folders: ['all'] })).toEqual([
      'sent_001',
    ])
  })

  it('searches the message body for text', () => {
    expect(ids({ text: 'signée', folders: ['all'] })).toContain('sent_001')
  })

  it('combines criteria with AND by default', () => {
    expect(
      ids({ from: ['c.martin'], subject: 'Suivi', folders: ['INBOX'] })
    ).toEqual(['inbox_008'])
  })

  it('filters on size, larger or smaller', () => {
    const larger = search({
      size: { value: 20, operator: '>', unit: 'kb' },
      folders: ['all'],
    }).mails
    expect(larger.map((m) => m.id)).toEqual(['inbox_010'])

    const smaller = ids({
      size: { value: 0.5, operator: '<', unit: 'kb' },
      folders: ['all'],
    })
    expect(smaller).toEqual(['drafts_002'])

    expect(
      ids({ size: { value: 1, operator: '>', unit: 'mb' }, folders: ['all'] })
    ).toEqual([])
  })

  it('searches every folder for "all" and honors include_subfolders', () => {
    expect(ids({ from: ['a11y@example.com'], folders: ['all'] })).toEqual([
      'proj_r_003',
    ])
    expect(
      ids({
        from: ['a11y@example.com'],
        folders: ['Projects/2024/Frontend'],
        include_subfolders: false,
      })
    ).toEqual([])
    expect(
      ids({
        from: ['a11y@example.com'],
        folders: ['Projects/2024/Frontend'],
        include_subfolders: true,
      })
    ).toEqual(['proj_r_003'])
  })

  it('applies the non-criteria filters', () => {
    expect(ids({ labels: ['Friends'], folders: ['all'] })).toEqual([
      'inbox_003',
    ])
    expect(
      ids({ is_flagged: true, has_attachment: true, folders: ['all'] })
    ).toEqual(['inbox_002'])
    expect(ids({ attachment_type: ['pdf'], folders: ['INBOX'] })).toContain(
      'inbox_002'
    )
    expect(
      ids({ is_read: false, from: ['c.martin'], folders: ['INBOX'] })
    ).not.toContain('inbox_008')
    expect(
      ids({
        date_range: { start: '2026-04-20', end: '2026-04-20' },
        folders: ['all'],
      }).sort()
    ).toEqual(['drafts_002', 'inbox_001'])
  })

  it('paginates the results', () => {
    const result = search({ from: ['reports@sogo.org'] }, 'page=2&page_size=20')

    expect(result.total).toBe(35)
    expect(result.page).toBe(2)
    expect(result.mails).toHaveLength(15)
    expect(result.hasPreviousPage).toBe(true)
    expect(result.hasNextPage).toBe(false)
  })
})
