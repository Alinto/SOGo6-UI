import { render, screen } from '@testing-library/react'
import { useMailRowLink } from '../mail-row-link'

const openDraftIfNeeded = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  Link: 'a',
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
