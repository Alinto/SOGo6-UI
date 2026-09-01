import { render, screen } from '@testing-library/react'
import React from 'react'
import FolderDroppable, {
  FOLDER_DROP_ALLOWED_CLASS,
  FOLDER_DROP_FORBIDDEN_CLASS,
  FOLDER_DWELL_EXPAND_MS,
} from '../folder-droppable'

const mockUseDndContext = jest.fn(() => ({
  active: null,
  over: null,
}))

jest.mock('@dnd-kit/core', () => ({
  useDndContext: () => mockUseDndContext(),
}))

jest.mock('@/components/dnd/droppable', () => ({
  __esModule: true,
  default: ({
    children,
    id,
    disabled,
    className,
    dataDrop,
  }: {
    children: React.ReactNode
    id: string
    disabled?: boolean
    className?: string
    dataDrop?: string
  }) => (
    <div
      data-testid="droppable"
      data-id={id}
      data-disabled={disabled ? 'true' : 'false'}
      data-drop={dataDrop}
      className={className}
    >
      {children}
    </div>
  ),
}))

describe('FolderDroppable', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockUseDndContext.mockReturnValue({ active: null, over: null })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('registers a namespaced folder id', () => {
    render(
      <FolderDroppable folderPath="Archive" folderType="NORMAL">
        <span>Archive</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-id',
      'folder:Archive'
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-disabled',
      'false'
    )
  })

  it('disables virtual and non-selectable folders', () => {
    const { rerender } = render(
      <FolderDroppable folderPath="Virtual" selectable={false} isVirtual>
        <span>Virtual</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-disabled',
      'true'
    )

    rerender(
      <FolderDroppable folderPath="INBOX" selectable={false}>
        <span>INBOX</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-disabled',
      'true'
    )
  })

  it('keeps the source folder droppable but marks it forbidden', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
      over: null,
    })

    render(
      <FolderDroppable folderPath="INBOX" folderType="INBOX" folderName="Inbox">
        <span>Inbox</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-disabled',
      'false'
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-drop',
      'forbidden'
    )
  })

  it('forbids dropping inbox mail onto Sent', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
      over: {
        data: {
          current: { type: 'folder', folderPath: 'Sent', folderType: 'SENT' },
        },
      },
    })

    render(
      <FolderDroppable folderPath="Sent" folderType="SENT" folderName="Sent">
        <span>Sent</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-drop',
      'forbidden'
    )
  })

  it('highlights the hovered valid folder', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hi',
            from: 'A',
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
          },
        },
      },
    })

    render(
      <FolderDroppable
        folderPath="Archive"
        folderType="NORMAL"
        folderName="Archive"
      >
        <span>Archive</span>
      </FolderDroppable>
    )
    const node = screen.getByTestId('droppable')
    expect(node).toHaveAttribute('data-drop', 'allowed')
    expect(node).toHaveClass(FOLDER_DROP_ALLOWED_CLASS)
    expect(node).not.toHaveClass(FOLDER_DROP_FORBIDDEN_CLASS)
  })

  it('outlines the hovered invalid folder as forbidden', () => {
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            folderType: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
      over: {
        data: {
          current: { type: 'folder', folderPath: 'Sent', folderType: 'SENT' },
        },
      },
    })

    render(
      <FolderDroppable folderPath="Sent" folderType="SENT" folderName="Sent">
        <span>Sent</span>
      </FolderDroppable>
    )
    const node = screen.getByTestId('droppable')
    expect(node).toHaveAttribute('data-drop', 'forbidden')
    expect(node).toHaveClass(FOLDER_DROP_FORBIDDEN_CLASS)
    expect(node).not.toHaveClass(FOLDER_DROP_ALLOWED_CLASS)
  })

  it('disables folders when the drag is not a mail', () => {
    mockUseDndContext.mockReturnValue({
      active: { data: { current: { type: 'contact', contactId: 'c' } } },
      over: null,
    })

    render(
      <FolderDroppable folderPath="Archive" folderType="NORMAL">
        <span>Archive</span>
      </FolderDroppable>
    )
    expect(screen.getByTestId('droppable')).toHaveAttribute(
      'data-disabled',
      'true'
    )
  })

  it('expands nested folders after dwell', () => {
    const onDwellExpand = jest.fn()
    mockUseDndContext.mockReturnValue({
      active: {
        data: {
          current: {
            type: 'mail',
            mailId: '1',
            accountId: '0',
            folder: 'INBOX',
            subject: 'Hi',
            from: 'A',
            count: 1,
          },
        },
      },
      over: {
        data: { current: { type: 'folder', folderPath: 'Projects' } },
      },
    })

    render(
      <FolderDroppable
        folderPath="Projects"
        folderType="NORMAL"
        hasSubfolders
        onDwellExpand={onDwellExpand}
      >
        <span>Projects</span>
      </FolderDroppable>
    )

    expect(onDwellExpand).not.toHaveBeenCalled()
    jest.advanceTimersByTime(FOLDER_DWELL_EXPAND_MS)
    expect(onDwellExpand).toHaveBeenCalledTimes(1)
  })
})
