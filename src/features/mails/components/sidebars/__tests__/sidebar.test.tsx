import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImapFolder } from '../../mails-types'
import MailSidebar from '../sidebar'

// Mock all UI components
jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, ...props }: any) => (
    <div data-testid="collapsible" {...props}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({ children, ...props }: any) => (
    <div data-testid="collapsible-trigger" {...props}>
      {children}
    </div>
  ),
  CollapsibleContent: ({ children, ...props }: any) => (
    <div data-testid="collapsible-content" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children, ...props }: any) => (
    <div data-testid="sidebar-group" {...props}>
      {children}
    </div>
  ),
  SidebarMenu: ({ children, ...props }: any) => (
    <div data-testid="sidebar-menu" {...props}>
      {children}
    </div>
  ),
  SidebarMenuItem: ({ children, ...props }: any) => (
    <div data-testid="sidebar-menu-item" {...props}>
      {children}
    </div>
  ),
  SidebarMenuSub: ({ children, ...props }: any) => (
    <div data-testid="sidebar-menu-sub" {...props}>
      {children}
    </div>
  ),
  SidebarMenuSubItem: ({ children, ...props }: any) => (
    <div data-testid="sidebar-menu-sub-item" {...props}>
      {children}
    </div>
  ),
}))

const mockOpenFolder = jest.fn()

jest.mock('@/features/offline/offline-nav-context', () => ({
  useOfflineNav: jest.fn(() => ({
    openFolder: mockOpenFolder,
    folderPathOverride: null,
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    account: 'test@example.com',
  })),
  usePathname: jest.fn(() => '/u/test@example.com/INBOX'),
}))

jest.mock('../account-switcher', () => ({
  __esModule: true,
  AccountSwitcher: () => (
    <div data-testid="account-switcher">Account Switcher</div>
  ),
}))

jest.mock('../compose-opener', () => ({
  __esModule: true,
  default: () => <div data-testid="compose-opener">Compose Opener</div>,
}))

jest.mock('../mailbox-quota', () => ({
  __esModule: true,
  MailboxQuota: () => <div data-testid="mailbox-quota">Mailbox Quota</div>,
}))

jest.mock('@/features/offline/components/outbox-sidebar-item', () => ({
  __esModule: true,
  default: () => <div data-testid="outbox-sidebar-item">Outbox</div>,
}))

jest.mock('../sidebar-item', () => ({
  __esModule: true,
  default: ({ name, folderPath, handleClick, isActive }: any) => (
    <button
      data-testid={`sidebar-item-${folderPath ?? name}`}
      data-active={isActive ? 'true' : 'false'}
      onClick={handleClick}
    >
      {name}
    </button>
  ),
}))

jest.mock('../folder-droppable', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-skeleton">Skeleton</div>,
}))

jest.mock('../../../store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
}))

jest.mock('../../utils', () => ({
  iconSelector: jest.fn((path) => {
    if (path === 'INBOX') return 'inbox'
    if (path === 'Sent') return 'send'
    if (path === 'Drafts') return 'file-text'
    if (path === 'Trash') return 'trash-2'
    if (path === 'Junk') return 'alert-triangle'
    if (path === 'Archive') return 'archive'
    return 'folder'
  }),
  iconSelectorByType: jest.fn((type) => {
    if (type === 'INBOX') return 'inbox'
    if (type === 'SENT') return 'send'
    if (type === 'DRAFT' || type === 'DRAFTS') return 'file-text'
    if (type === 'TRASH') return 'trash-2'
    if (type === 'JUNK') return 'alert-triangle'
    return 'folder'
  }),
  nameSelector: jest.fn((name) => {
    if (name.toLowerCase() === 'inbox') return 'folders.inbox.string'
    if (name.toLowerCase() === 'sent') return 'folders.sent.string'
    if (name.toLowerCase() === 'drafts') return 'folders.drafts.string'
    if (name.toLowerCase() === 'trash') return 'folders.trash.string'
    if (name.toLowerCase() === 'junk') return 'folders.junk.string'
    if (name.toLowerCase() === 'archive') return 'folders.archive.string'
    return undefined
  }),
  nameSelectorByType: jest.fn((type) => {
    if (type === 'INBOX') return 'folders.inbox.string'
    if (type === 'SENT') return 'folders.sent.string'
    if (type === 'DRAFT' || type === 'DRAFTS') return 'folders.drafts.string'
    if (type === 'TRASH') return 'folders.trash.string'
    if (type === 'JUNK') return 'folders.junk.string'
    return undefined
  }),
}))

import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { useParams } from 'next/navigation'
import { useGetFoldersQuery } from '../../../store/mails-api'

describe('MailSidebar Component', () => {
  const mockFolders: ImapFolder[] = [
    {
      name: 'INBOX',
      path: 'INBOX',
      type: 'INBOX',
      unseen_count: 5,
      messages: 50,
      flags: [],
      delimiter: '/',
      readOnly: false,
      selectable: true,
      default: true,
    },
    {
      name: 'Sent',
      path: 'Sent',
      type: 'SENT',
      unseen_count: 0,
      messages: 30,
      flags: [],
      delimiter: '/',
      readOnly: false,
      selectable: true,
      default: false,
    },
    {
      name: 'Work',
      path: 'Work',
      type: 'NORMAL',
      unseen_count: 2,
      messages: 15,
      flags: [],
      delimiter: '/',
      readOnly: false,
      selectable: true,
      default: false,
      subfolders: [
        {
          name: 'Projects',
          path: 'Work/Projects',
          type: 'NORMAL',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [],
        },
      ],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useParams as jest.Mock).mockReturnValue({
      account: 'test@example.com',
    })
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: mockFolders,
      isFetching: false,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render Behavior', () => {
    it('should render the sidebar structure', () => {
      render(<MailSidebar />)

      const sidebarGroups = screen.getAllByTestId('sidebar-group')
      expect(sidebarGroups.length).toBeGreaterThanOrEqual(3)
    })

    it('should render account switcher', () => {
      render(<MailSidebar />)

      expect(screen.getByTestId('account-switcher')).toBeInTheDocument()
    })

    it('should render compose opener', () => {
      render(<MailSidebar />)

      expect(screen.getByTestId('compose-opener')).toBeInTheDocument()
    })

    it('should render folder list', () => {
      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-INBOX')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-item-Sent')).toBeInTheDocument()
    })

    it('should apply proper styling classes to groups', () => {
      const { container } = render(<MailSidebar />)

      const groups = container.querySelectorAll('[data-testid="sidebar-group"]')
      expect(groups.length).toBeGreaterThan(0)
    })
  })

  describe('Loading State', () => {
    it('should show skeleton while fetching', () => {
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isFetching: true,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument()
    })

    it('should not show folders while fetching', () => {
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isFetching: true,
      })

      render(<MailSidebar />)

      expect(screen.queryByTestId('sidebar-item-INBOX')).not.toBeInTheDocument()
    })

    it('should show folders when not fetching', () => {
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: mockFolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-INBOX')).toBeInTheDocument()
    })
  })

  describe('Sidebar Structure', () => {
    it('should have account switcher group at top', () => {
      const { container } = render(<MailSidebar />)

      const groups = container.querySelectorAll('[data-testid="sidebar-group"]')
      const firstGroup = groups[0]
      expect(firstGroup?.textContent).toContain('Account Switcher')
    })

    it('should have sticky compose opener group', () => {
      const { container } = render(<MailSidebar />)

      const stickyGroup = container.querySelector(
        '[data-testid="sidebar-group"][class*="sticky"]'
      )
      expect(stickyGroup).toBeInTheDocument()
    })

    it('should have scrollable folders group', () => {
      const { container } = render(<MailSidebar />)

      const scrollableGroup = container.querySelector(
        '[data-testid="sidebar-group"][class*="overflow-y-auto"]'
      )
      expect(scrollableGroup).toBeInTheDocument()
    })

    it('should keep compose in the sticky group without Outbox', () => {
      const { container } = render(<MailSidebar />)

      const stickyGroup = container.querySelector(
        '[data-testid="sidebar-group"][class*="sticky"]'
      )
      expect(stickyGroup).toBeInTheDocument()
      expect(
        stickyGroup?.querySelector('[data-testid="compose-opener"]')
      ).toBeInTheDocument()
      expect(
        stickyGroup?.querySelector('[data-testid="outbox-sidebar-item"]')
      ).not.toBeInTheDocument()
    })

    it('should insert Outbox in the folder list before Sent when Drafts is missing', () => {
      const { container } = render(<MailSidebar />)
      const scrollableGroup = container.querySelector(
        '[data-testid="sidebar-group"][class*="overflow-y-auto"]'
      )
      const order = Array.from(
        scrollableGroup?.querySelectorAll(
          '[data-testid^="sidebar-item-"], [data-testid="outbox-sidebar-item"]'
        ) ?? []
      ).map((el) => el.getAttribute('data-testid'))

      expect(order).toEqual([
        'sidebar-item-INBOX',
        'outbox-sidebar-item',
        'sidebar-item-Sent',
        'sidebar-item-Work',
        'sidebar-item-Work/Projects',
      ])
    })

    it('should insert Outbox after Drafts when present', () => {
      const foldersWithDrafts: ImapFolder[] = [
        {
          name: 'INBOX',
          path: 'INBOX',
          type: 'INBOX',
          unseen_count: 0,
          messages: 0,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: true,
        },
        {
          name: 'Drafts',
          path: 'Drafts',
          type: 'DRAFT',
          unseen_count: 0,
          messages: 0,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
        {
          name: 'Sent',
          path: 'Sent',
          type: 'SENT',
          unseen_count: 0,
          messages: 0,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithDrafts,
        isFetching: false,
      })

      const { container } = render(<MailSidebar />)
      const scrollableGroup = container.querySelector(
        '[data-testid="sidebar-group"][class*="overflow-y-auto"]'
      )
      const order = Array.from(
        scrollableGroup?.querySelectorAll(
          '[data-testid^="sidebar-item-"], [data-testid="outbox-sidebar-item"]'
        ) ?? []
      ).map((el) => el.getAttribute('data-testid'))

      expect(order).toEqual([
        'sidebar-item-INBOX',
        'sidebar-item-Drafts',
        'outbox-sidebar-item',
        'sidebar-item-Sent',
      ])
    })

    it('should render all folders', () => {
      render(<MailSidebar />)

      mockFolders.forEach((folder) => {
        if (folder.subfolders?.length === 0 || !folder.subfolders) {
          const folderItem = screen.queryByTestId(`sidebar-item-${folder.path}`)
          expect(folderItem).toBeInTheDocument()
        }
      })
    })
  })

  describe('Folder Navigation', () => {
    it('should open folder with correct account and path on click', async () => {
      const user = userEvent.setup()

      render(<MailSidebar />)

      const inboxFolder = screen.getByTestId('sidebar-item-INBOX')
      await user.click(inboxFolder)

      expect(mockOpenFolder).toHaveBeenCalledWith(
        'test@example.com',
        'INBOX',
        'folders.inbox.string'
      )
    })

    it('should open folder with special characters in path', async () => {
      const user = userEvent.setup()

      const foldersWithSpecialChars: ImapFolder[] = [
        {
          name: 'Test Folder',
          path: 'Test Folder',
          unseen_count: 0,
          messages: 10,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSpecialChars,
        isFetching: false,
      })

      render(<MailSidebar />)

      const folder = screen.getByTestId('sidebar-item-Test Folder')
      await user.click(folder)

      expect(mockOpenFolder).toHaveBeenCalledWith(
        'test@example.com',
        'Test Folder',
        'Test Folder'
      )
    })

    it('should use current account from params', async () => {
      const user = userEvent.setup()
      ;(useParams as jest.Mock).mockReturnValue({ account: 'work@example.com' })

      render(<MailSidebar />)

      const inboxFolder = screen.getByTestId('sidebar-item-INBOX')
      await user.click(inboxFolder)

      expect(mockOpenFolder).toHaveBeenCalledWith(
        'work@example.com',
        'INBOX',
        'folders.inbox.string'
      )
    })
  })

  describe('Recursive Folder Items', () => {
    it('should render folders without subfolders', () => {
      const foldersWithoutSubfolders: ImapFolder[] = [
        {
          name: 'Simple',
          path: 'Simple',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithoutSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-Simple')).toBeInTheDocument()
    })

    it('should render folders with subfolders as collapsible', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      const collapsibles = screen.getAllByTestId('collapsible')
      expect(collapsibles.length).toBeGreaterThan(0)
    })

    it('should render subfolders in collapsible content', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('collapsible-content')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-menu-sub')).toBeInTheDocument()
    })

    it('should render multiple levels of nested folders', () => {
      const nestedFolders: ImapFolder[] = [
        {
          name: 'Level1',
          path: 'Level1',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Level2',
              path: 'Level1/Level2',
              unseen_count: 0,
              messages: 3,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
              subfolders: [
                {
                  name: 'Level3',
                  path: 'Level1/Level2/Level3',
                  unseen_count: 0,
                  messages: 1,
                  flags: [],
                  delimiter: '/',
                  readOnly: false,
                  selectable: true,
                  default: false,
                },
              ],
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: nestedFolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      const collapsibles = screen.getAllByTestId('collapsible')
      expect(collapsibles.length).toBeGreaterThan(0)
    })
  })

  describe('Folder Icons and Names', () => {
    it('should show INBOX with inbox icon', () => {
      const { iconSelectorByType } = require('../../utils')
      render(<MailSidebar />)

      expect(iconSelectorByType).toHaveBeenCalledWith('INBOX')
    })

    it('should show translated folder names for default folders', () => {
      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-INBOX')).toHaveTextContent(
        'folders.inbox.string'
      )
      expect(screen.getByTestId('sidebar-item-Sent')).toHaveTextContent(
        'folders.sent.string'
      )
    })

    it('should show custom folder names for non-default folders', () => {
      const customFolders: ImapFolder[] = [
        {
          name: 'CustomFolder',
          path: 'CustomFolder',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: customFolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(
        screen.getByTestId('sidebar-item-CustomFolder')
      ).toBeInTheDocument()
    })

    it('should show folder icon for non-default folders', () => {
      const { iconSelectorByType } = require('../../utils')
      const customFolders: ImapFolder[] = [
        {
          name: 'CustomFolder',
          path: 'CustomFolder',
          type: 'NORMAL',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: customFolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(iconSelectorByType).toHaveBeenCalledWith('NORMAL')
    })
  })

  describe('Active State', () => {
    it('should mark current folder as active from route folder param', () => {
      ;(useParams as jest.Mock).mockReturnValue({
        account: 'test@example.com',
        folder: 'INBOX',
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-INBOX')).toHaveAttribute(
        'data-active',
        'true'
      )
      expect(screen.getByTestId('sidebar-item-Sent')).toHaveAttribute(
        'data-active',
        'false'
      )
    })

    it('should update active state when route folder param changes', () => {
      ;(useParams as jest.Mock).mockReturnValue({
        account: 'test@example.com',
        folder: 'INBOX',
      })
      const { rerender } = render(<MailSidebar />)

      ;(useParams as jest.Mock).mockReturnValue({
        account: 'test@example.com',
        folder: 'Sent',
      })
      rerender(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-Sent')).toHaveAttribute(
        'data-active',
        'true'
      )
      expect(screen.getByTestId('sidebar-item-INBOX')).toHaveAttribute(
        'data-active',
        'false'
      )
    })

    it('should match folder path exactly, not as substring', () => {
      const foldersWithTrash: ImapFolder[] = [
        {
          name: 'Trash',
          path: 'Trash',
          unseen_count: 0,
          messages: 0,
          flags: [],
          delimiter: '.',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithTrash,
        isFetching: false,
      })
      ;(useParams as jest.Mock).mockReturnValue({
        account: 'test@example.com',
        folder: 'INBOX.Trash',
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-Trash')).toHaveAttribute(
        'data-active',
        'false'
      )
    })
  })

  describe('Empty and Edge Cases', () => {
    it('should handle empty folder list', () => {
      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: [],
        isFetching: false,
      })

      const { container } = render(<MailSidebar />)

      expect(container).toBeInTheDocument()
    })

    it('should handle undefined subfolders', () => {
      const foldersWithoutSubfolders: ImapFolder[] = [
        {
          name: 'Test',
          path: 'Test',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: undefined,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithoutSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-Test')).toBeInTheDocument()
    })

    it('should handle empty subfolders array', () => {
      const foldersWithEmptySubfolders: ImapFolder[] = [
        {
          name: 'Test',
          path: 'Test',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithEmptySubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-item-Test')).toBeInTheDocument()
    })

    it('should handle folder names with special characters', () => {
      const specialFolders: ImapFolder[] = [
        {
          name: 'Test [Important]',
          path: 'Test [Important]',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: specialFolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(
        screen.getByTestId('sidebar-item-Test [Important]')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button elements for folders', () => {
      render(<MailSidebar />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should use translations for all text content', () => {
      const mockT = jest.fn((key: string) => `translated_${key}`)
      const { useTranslations: mockUseTranslations } = require('next-intl')
      mockUseTranslations.mockReturnValue(mockT)

      render(<MailSidebar />)

      expect(mockT).toHaveBeenCalled()
    })
  })

  describe('Component Integration', () => {
    it('should call useGetFoldersQuery on mount', () => {
      render(<MailSidebar />)

      expect(useGetFoldersQuery).toHaveBeenCalled()
    })

    it('should use correct parameters from useParams', () => {
      render(<MailSidebar />)

      expect(useParams).toHaveBeenCalled()
    })

    it('should read folder route param for active state', () => {
      render(<MailSidebar />)

      expect(useParams).toHaveBeenCalled()
    })

    it('should use offline nav for navigation', async () => {
      render(<MailSidebar />)

      expect(useOfflineNav).toHaveBeenCalled()
    })
  })

  describe('Collapsible State Management', () => {
    it('should render controlled collapsible for folders with subfolders', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('collapsible')).toBeInTheDocument()
      expect(screen.getByTestId('collapsible-content')).toBeInTheDocument()
    })

    it('should hide collapsible in icon mode', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      const { container } = render(<MailSidebar />)

      const collapsible = container.querySelector('[data-testid="collapsible"]')
      expect(collapsible).toHaveClass('group-data-[collapsible=icon]:hidden')
    })
  })

  describe('Menu Structure', () => {
    it('should wrap account switcher in menu item', () => {
      const { container } = render(<MailSidebar />)

      const menuItems = container.querySelectorAll(
        '[data-testid="sidebar-menu-item"]'
      )
      expect(menuItems.length).toBeGreaterThan(0)
    })

    it('should wrap compose opener in menu item', () => {
      const { container } = render(<MailSidebar />)

      const composeMenuItem = Array.from(
        container.querySelectorAll('[data-testid="sidebar-menu-item"]')
      ).find((item) => item.textContent?.includes('Compose'))

      expect(composeMenuItem).toBeInTheDocument()
    })

    it('should use SidebarMenuSub for subfolders', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-menu-sub')).toBeInTheDocument()
    })

    it('should wrap subfolders in SidebarMenuSubItem', () => {
      const foldersWithSubfolders: ImapFolder[] = [
        {
          name: 'Parent',
          path: 'Parent',
          unseen_count: 0,
          messages: 5,
          flags: [],
          delimiter: '/',
          readOnly: false,
          selectable: true,
          default: false,
          subfolders: [
            {
              name: 'Child',
              path: 'Parent/Child',
              unseen_count: 0,
              messages: 2,
              flags: [],
              delimiter: '/',
              readOnly: false,
              selectable: true,
              default: false,
            },
          ],
        },
      ]

      ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
        data: foldersWithSubfolders,
        isFetching: false,
      })

      render(<MailSidebar />)

      expect(screen.getByTestId('sidebar-menu-sub-item')).toBeInTheDocument()
    })
  })
})
