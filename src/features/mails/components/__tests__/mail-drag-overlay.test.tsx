import { render, screen } from '@testing-library/react'
import MailDragOverlay from '../mail-drag-overlay'

const mockUseDndContext = jest.fn(() => ({
  active: {
    data: {
      current: {
        type: 'mail',
        mailId: '1',
        accountId: '0',
        folder: 'INBOX',
        folderType: 'INBOX',
        subject: 'Hello',
        from: 'Ada',
        count: 1,
      },
    },
  },
  over: null,
}))

jest.mock('@dnd-kit/core', () => ({
  useDndContext: () => mockUseDndContext(),
}))

jest.mock('next-intl', () => ({
  useTranslations:
    () => (key: string, values?: { number?: number; folder?: string }) => {
      if (key === 'messages_number.string') return `${values?.number} messages`
      if (key === 'drag_overlay.move_to.string')
        return `Move to ${values?.folder}`
      if (key === 'drag_overlay.cannot_drop.string') return "Can't drop here"
      return key
    },
}))

describe('MailDragOverlay', () => {
  beforeEach(() => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hello',
            from: 'Ada',
            count: 1,
          },
        },
      },
      over: null,
    })
  })

  it('renders from and subject without a count badge for a single mail', () => {
    render(<MailDragOverlay from="Ada" subject="Hello" count={1} />)
    expect(screen.getByText('Ada')).toBeInTheDocument()
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.queryByText(/messages/)).not.toBeInTheDocument()
  })

  it('shows a count badge when dragging several mails', () => {
    render(<MailDragOverlay from="Ada" subject="Hello" count={3} />)
    expect(screen.getByText('3 messages')).toBeInTheDocument()
  })

  it('shows the destination folder when hovering a valid target', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hello',
            from: 'Ada',
            count: 1,
          },
        },
      },
      over: {
        data: {
          current: {
            type: 'folder',
            folderPath: 'Archive',
            folderType: 'NORMAL',
            folderName: 'Archive',
          },
        },
      },
    })
    render(<MailDragOverlay from="Ada" subject="Hello" count={1} />)
    expect(screen.getByText('Move to Archive')).toBeInTheDocument()
  })

  it('shows cannot-drop when hovering Sent with inbox mail', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hello',
            from: 'Ada',
            count: 1,
          },
        },
      },
      over: {
        data: {
          current: {
            type: 'folder',
            folderPath: 'Sent',
            folderType: 'SENT',
            folderName: 'Sent',
          },
        },
      },
    })
    render(<MailDragOverlay from="Ada" subject="Hello" count={1} />)
    expect(screen.getByText("Can't drop here")).toBeInTheDocument()
  })
})
