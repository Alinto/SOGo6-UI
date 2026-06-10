import { FOLDERS_NAME } from '@/features/mails/components/constants'

describe('FOLDERS_NAME', () => {
  it('defines the expected well-known folder names', () => {
    expect(FOLDERS_NAME).toEqual({
      DRAFT: 'Drafts',
      SENT: 'Sent',
      INBOX: 'INBOX',
      TRASH: 'Trash',
      JUNK: 'Junk',
    })
  })
})
