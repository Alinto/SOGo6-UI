import { render, screen } from '@testing-library/react'
import { useMailRowLink } from '../mail-row-link'

const openDraftIfNeeded = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  Link: 'a',
}))

let mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

jest.mock('@/features/mails/hooks/use-open-draft-on-click', () => ({
  useOpenDraftOnClick: () => ({ openDraftIfNeeded }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

function Row({
  folderType,
  onOpenMail,
}: {
  folderType?: 'INBOX' | 'DRAFT'
  onOpenMail?: (id: string, folder: string) => void
}) {
  const { href, onClick } = useMailRowLink({
    folderType,
    mailFolderPath: 'INBOX',
    accountId: '0',
    mailId: '42',
    onOpenMail,
  })
  return (
    <a href={href} onClick={onClick}>
      Open
    </a>
  )
}

function click(link: HTMLElement, init: MouseEventInit = {}) {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    ...init,
  })
  link.dispatchEvent(event)
  return event
}

describe('useMailRowLink', () => {
  beforeEach(() => {
    openDraftIfNeeded.mockReset()
    openDraftIfNeeded.mockResolvedValue(false)
    mockSearchParams = new URLSearchParams()
  })

  it('links to the mail without query when the list is not filtered', () => {
    render(<Row />)

    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      '/u/0/INBOX/42'
    )
  })

  it('keeps the list quick filter in the mail link', () => {
    mockSearchParams = new URLSearchParams('filter=attachments&page=3')
    render(<Row />)

    expect(screen.getByRole('link', { name: 'Open' })).toHaveAttribute(
      'href',
      '/u/0/INBOX/42?filter=attachments'
    )
  })

  it('blocks navigation before a draft finishes opening', () => {
    openDraftIfNeeded.mockReturnValue(new Promise(() => undefined))
    render(<Row folderType="DRAFT" />)

    const event = click(screen.getByRole('link', { name: 'Open' }))

    expect(event.defaultPrevented).toBe(true)
    expect(openDraftIfNeeded).toHaveBeenCalledTimes(1)
  })

  it('blocks navigation before the classic panel opens', () => {
    const onOpenMail = jest.fn()
    render(<Row onOpenMail={onOpenMail} />)

    const event = click(screen.getByRole('link', { name: 'Open' }))

    expect(event.defaultPrevented).toBe(true)
  })

  it('lets a modified click open the message in a new tab', () => {
    render(<Row folderType="DRAFT" onOpenMail={jest.fn()} />)

    const event = click(screen.getByRole('link', { name: 'Open' }), {
      ctrlKey: true,
    })

    expect(event.defaultPrevented).toBe(false)
    expect(openDraftIfNeeded).not.toHaveBeenCalled()
  })

  it('follows the link for a normal message', () => {
    render(<Row folderType="INBOX" />)

    const event = click(screen.getByRole('link', { name: 'Open' }))

    expect(event.defaultPrevented).toBe(false)
  })
})
