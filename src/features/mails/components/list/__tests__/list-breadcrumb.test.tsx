import { LONG_PRESS_DELAY } from '@/hooks/use-long-press'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import type { ImapFolder } from '../../../mails-types'
import { useGetFoldersQuery } from '../../../store/mails-api'
import ListBreadcrumb from '../list-breadcrumb'

const mockOpenFolder = jest.fn()

jest.mock('@/features/offline/offline-nav-context', () => ({
  useOfflineNav: jest.fn(() => ({ openFolder: mockOpenFolder })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
  useLocale: jest.fn(() => 'en'),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  getPathname: ({ locale, href }: { locale: string; href: string }) =>
    `/${locale}${href}`,
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFoldersQuery: jest.fn(),
}))

const folder = (
  path: string,
  subfolders?: ImapFolder[],
  extra: Partial<ImapFolder> = {}
): ImapFolder => ({
  name: path.split('/').pop() ?? path,
  path,
  unseen_count: 0,
  messages: 0,
  flags: [],
  delimiter: '/',
  readOnly: false,
  selectable: true,
  subfolders,
  ...extra,
})

// a/b/c/d/e/f/g: 7 nested levels.
const deepFolder = (depth: number, parent = ''): ImapFolder => {
  const path = parent ? `${parent}/${'abcdefg'[depth]}` : 'a'
  return folder(path, depth < 6 ? [deepFolder(depth + 1, path)] : undefined)
}

const tree: ImapFolder[] = [
  folder('INBOX', [folder('INBOX/tutu')], { type: 'INBOX' }),
  deepFolder(0),
  folder('Shared', [folder('Shared/Contrib')], { selectable: false }),
]

const renderBreadcrumb = (folderPath: string) =>
  render(
    <ListBreadcrumb
      accountId="0"
      folderPath={folderPath}
      fallbackTitle="Fallback"
    />
  )

describe('ListBreadcrumb', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({ data: tree })
  })

  it('renders every folder from the root to the current one', () => {
    renderBreadcrumb('INBOX/tutu')
    const nav = screen.getByRole('navigation', { name: 'breadcrumb.string' })
    const items = nav.querySelectorAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('folders.inbox.string')
    expect(items[1]).toHaveTextContent('tutu')
  })

  it('links each folder to its url and marks the current one', () => {
    renderBreadcrumb('INBOX/tutu')
    const [inbox, tutu] = screen.getAllByRole('link')
    expect(inbox).toHaveAttribute('href', '/en/u/0/INBOX')
    expect(tutu).toHaveAttribute('href', '/en/u/0/INBOX%2Ftutu')
    expect(tutu).toHaveAttribute('aria-current', 'page')
    expect(inbox).not.toHaveAttribute('aria-current')
  })

  it('opens the clicked folder', () => {
    renderBreadcrumb('INBOX/tutu')
    fireEvent.click(screen.getAllByRole('link')[0]!)
    expect(mockOpenFolder).toHaveBeenCalledWith(
      '0',
      'INBOX',
      'folders.inbox.string'
    )
  })

  it('lets the browser handle modifier clicks', () => {
    renderBreadcrumb('INBOX/tutu')
    fireEvent.click(screen.getAllByRole('link')[0]!, { ctrlKey: true })
    expect(mockOpenFolder).not.toHaveBeenCalled()
  })

  it('does not link a folder that cannot be opened', () => {
    renderBreadcrumb('Shared/Contrib')
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent('Contrib')
    expect(
      within(screen.getByRole('navigation')).getByText('Shared')
    ).toBeInTheDocument()
  })

  it('falls back to the title when the folder is not in the tree', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({ data: undefined })
    renderBreadcrumb('INBOX')
    expect(screen.getByText('Fallback')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('keeps the breadcrumb look while the folders load', () => {
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
    })
    renderBreadcrumb('INBOX')
    expect(screen.getByText('Fallback').parentElement).toHaveClass(
      'h-9',
      'bg-primary'
    )
  })

  it('renders the suffix after the breadcrumb', () => {
    render(
      <ListBreadcrumb
        accountId="0"
        folderPath="INBOX/tutu"
        fallbackTitle="Fallback"
        suffix={<span>12 messages</span>}
      />
    )
    expect(screen.getByText('12 messages')).toBeInTheDocument()
  })

  describe('adapting to the available width', () => {
    // Every folder is 100px wide, the "…" 40px, the suffix 0px.
    let containerWidth = 0
    let resize: () => void = () => {}
    const originalResizeObserver = global.ResizeObserver

    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
        .mockImplementation(function (this: HTMLElement) {
          const kind = this.getAttribute('data-breadcrumb-measure')
          if (kind === 'folder') return 100
          if (kind === 'ellipsis') return 40
          if (this.classList.contains('flex-1')) return containerWidth
          return 0
        })
      global.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
        resize = () => callback([], {} as ResizeObserver)
        return {
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        }
      }) as unknown as typeof ResizeObserver
    })

    afterEach(() => {
      jest.restoreAllMocks()
      global.ResizeObserver = originalResizeObserver
    })

    const visibleItems = () =>
      Array.from(
        screen.getByRole('navigation').querySelectorAll('li'),
        (li) => li.textContent
      )

    it('shows only the first and current folders when space is short', () => {
      containerWidth = 300
      renderBreadcrumb('a/b/c/d/e/f/g')
      expect(visibleItems()).toEqual([
        'a',
        'breadcrumb_open_hidden_folder.string',
        'g',
      ])
    })

    it('shows every folder that fits, without ellipsis', () => {
      containerWidth = 300
      renderBreadcrumb('a/b/c')
      expect(visibleItems()).toEqual(['a', 'b', 'c'])
    })

    it('never shows more than five folders', () => {
      containerWidth = 1000
      renderBreadcrumb('a/b/c/d/e/f/g')
      expect(visibleItems()).toEqual([
        'a',
        'breadcrumb_open_hidden_folder.string',
        'd',
        'e',
        'f',
        'g',
      ])
    })

    it('updates when the available width changes', () => {
      containerWidth = 1000
      renderBreadcrumb('a/b/c/d/e/f/g')
      expect(visibleItems()).toHaveLength(6)

      // first + "…" + 2 last = 340
      containerWidth = 350
      act(() => resize())
      expect(visibleItems()).toEqual([
        'a',
        'breadcrumb_open_hidden_folder.string',
        'f',
        'g',
      ])
    })

    it('keeps the measuring copy out of the accessibility tree', () => {
      containerWidth = 1000
      renderBreadcrumb('a/b/c')
      expect(screen.getAllByRole('list')).toHaveLength(1)
    })
  })

  it('shows every level when there are at most five', () => {
    renderBreadcrumb('a/b/c/d/e')
    const items = screen.getByRole('navigation').querySelectorAll('li')
    expect(items).toHaveLength(5)
    expect(screen.queryByText('breadcrumb_hidden_folders.string')).toBeNull()
  })

  it('collapses the levels after the first one beyond five', () => {
    renderBreadcrumb('a/b/c/d/e/f/g')
    const items = screen.getByRole('navigation').querySelectorAll('li')
    expect(Array.from(items, (li) => li.textContent)).toEqual([
      'a',
      'breadcrumb_open_hidden_folder.string',
      'd',
      'e',
      'f',
      'g',
    ])
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(6)
    expect(links[links.length - 1]).toHaveAttribute('aria-current', 'page')
  })

  it('opens the second folder when clicking the ellipsis', () => {
    renderBreadcrumb('a/b/c/d/e/f/g')
    const ellipsis = screen.getByRole('link', {
      name: 'breadcrumb_open_hidden_folder.string',
    })
    expect(ellipsis).toHaveAttribute('href', '/en/u/0/a%2Fb')
    fireEvent.click(ellipsis)
    expect(mockOpenFolder).toHaveBeenCalledWith('0', 'a/b', 'b')
  })

  it('does not link the ellipsis when the second folder cannot be opened', () => {
    const b = folder('a/b', [deepFolder(2, 'a/b')], { selectable: false })
    ;(useGetFoldersQuery as jest.Mock).mockReturnValue({
      data: [folder('a', [b])],
    })
    renderBreadcrumb('a/b/c/d/e/f/g')
    expect(
      screen.queryByText('breadcrumb_open_hidden_folder.string')
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('breadcrumb_hidden_folders.string')
    ).toBeInTheDocument()
  })

  describe('full name tooltip', () => {
    afterEach(() => jest.restoreAllMocks())

    const mockWidths = (scrollWidth: number, clientWidth: number) => {
      jest
        .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
        .mockReturnValue(scrollWidth)
      jest
        .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
        .mockReturnValue(clientWidth)
    }

    it('shows the full name of a truncated folder', () => {
      mockWidths(200, 100)
      renderBreadcrumb('INBOX/tutu')
      act(() => screen.getAllByRole('link')[1]!.focus())
      expect(screen.getByRole('tooltip')).toHaveTextContent('tutu')
    })

    it('does not show a tooltip when the name fits', () => {
      mockWidths(100, 100)
      renderBreadcrumb('INBOX/tutu')
      act(() => screen.getAllByRole('link')[1]!.focus())
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    describe('on touch screens', () => {
      beforeEach(() => jest.useFakeTimers())
      afterEach(() => jest.useRealTimers())

      const longPress = (el: HTMLElement) => {
        fireEvent.touchStart(el)
        act(() => jest.advanceTimersByTime(LONG_PRESS_DELAY))
        fireEvent.touchEnd(el)
      }

      it('shows the full name on long press without navigating', () => {
        mockWidths(200, 100)
        renderBreadcrumb('INBOX/tutu')
        const tutu = screen.getAllByRole('link')[1]!
        longPress(tutu)
        expect(screen.getByRole('tooltip')).toHaveTextContent('tutu')

        // The click that ends the long press is ignored…
        fireEvent.click(tutu)
        expect(mockOpenFolder).not.toHaveBeenCalled()
        // …but a later tap navigates.
        fireEvent.click(tutu)
        expect(mockOpenFolder).toHaveBeenCalledWith('0', 'INBOX/tutu', 'tutu')
      })

      it('shows no tooltip on long press when the name fits', () => {
        mockWidths(100, 100)
        renderBreadcrumb('INBOX/tutu')
        longPress(screen.getAllByRole('link')[1]!)
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
      })

      it('shows the hidden folders on long press of the ellipsis', () => {
        renderBreadcrumb('a/b/c/d/e/f/g')
        longPress(
          screen.getByRole('link', {
            name: 'breadcrumb_open_hidden_folder.string',
          })
        )
        expect(screen.getByRole('tooltip')).toHaveTextContent('b / c')
      })
    })
  })

  it('lists the hidden folders in the ellipsis tooltip', () => {
    renderBreadcrumb('a/b/c/d/e/f/g')
    act(() =>
      screen
        .getByRole('link', { name: 'breadcrumb_open_hidden_folder.string' })
        .focus()
    )
    expect(screen.getByRole('tooltip')).toHaveTextContent('b / c')
  })
})
