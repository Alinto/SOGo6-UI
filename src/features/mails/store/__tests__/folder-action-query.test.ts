import { downloadSelectedMailsQuery, folderActionQuery } from '../mails-api'

describe('folderActionQuery', () => {
  it('renames a folder with POST action', () => {
    expect(
      folderActionQuery({
        accountId: '0',
        folderPath: 'Projects/Alpha',
        action: 'rename',
        data: 'Beta',
      })
    ).toEqual({
      url: 'mailboxes/0/folders/Projects%2FAlpha/action',
      method: 'POST',
      body: { action: 'rename', data: 'Beta' },
    })
  })

  it('sets the folder type with POST action', () => {
    expect(
      folderActionQuery({
        accountId: '0',
        folderPath: 'Archive',
        action: 'type',
        data: 'SENT',
      }).body
    ).toEqual({ action: 'type', data: 'SENT' })
  })
})

describe('downloadSelectedMailsQuery', () => {
  it('posts a download batch with integer uids', () => {
    const query = downloadSelectedMailsQuery({
      accountId: '0',
      folders: { INBOX: [1, 2] },
    })
    expect(query.url).toBe('mailboxes/0/batch-action')
    expect(query.method).toBe('POST')
    expect(query.body).toEqual({
      action: 'download',
      uids: { INBOX: [1, 2] },
    })
  })
})
