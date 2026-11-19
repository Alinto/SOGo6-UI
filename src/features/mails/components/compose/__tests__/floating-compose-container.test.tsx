import '@testing-library/jest-dom'

import { act, render, screen, waitFor } from '@testing-library/react'

import FloatingComposeContainer from '@/features/mails/components/compose/floating-compose-container'
import { selectOpenDraftIds } from '@/features/mails/store'
import { useLazyGetCurrentDraftsQuery } from '@/features/mails/store/mail-api'
import {
  useLazyGetFoldersQuery,
  useLazyGetMailQuery,
} from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import { useAppSelector } from '@/lib/redux/hooks'

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(() => ({ mainAccount: null })),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/features/mails/store/mail-api', () => ({
  useLazyGetCurrentDraftsQuery: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useLazyGetMailQuery: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useLazyGetFoldersQuery: jest.fn(() => [jest.fn(), { isLoading: false }]),
}))

jest.mock('@/features/mails/store/mail-compose-slice', () => ({
  createDraft: jest.fn(),
}))

jest.mock('@/features/mails/utils/mail-compose-from-api', () => ({
  apiDataToMailComposeDraft: jest.fn(),
}))

const mockFloatingCompose = jest.fn(({ draftId }: { draftId: string }) => (
  <div data-testid="floating-compose" data-draft-id={draftId}>
    {draftId}
  </div>
))

jest.mock('@/features/mails/components/compose/floating-compose', () => ({
  __esModule: true,
  default: (props: { draftId: string }) => mockFloatingCompose(props),
}))

jest.mock('@/features/mails/store', () => ({
  selectOpenDraftIds: jest.fn((state) => state.mailCompose.openDraftIds),
}))

type MockState = {
  mailCompose: {
    openDraftIds: string[]
  }
}

const mockUseAppSelector = useAppSelector as unknown as jest.Mock

describe('FloatingComposeContainer', () => {
  let mockState: MockState

  const renderComponent = () => render(<FloatingComposeContainer />)

  beforeEach(() => {
    jest.clearAllMocks()

    mockState = {
      mailCompose: {
        openDraftIds: [],
      },
    }

    mockUseAppSelector.mockImplementation((selector) => selector(mockState))
  })

  describe('basic rendering', () => {
    it('should render nothing when there are no open drafts', () => {
      const { container } = renderComponent()

      expect(container.firstChild).toBeNull()
      expect(screen.queryByTestId('floating-compose')).not.toBeInTheDocument()
    })

    it('should render the container when at least one draft is open', () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      const { container } = renderComponent()
      const wrapper = container.querySelector('div[class*="flex-row-reverse"]')

      expect(wrapper).toBeInTheDocument()
      expect(screen.getByTestId('floating-compose')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('should select open draft ids from the store selector', () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      renderComponent()

      expect(mockUseAppSelector).toHaveBeenCalledWith(selectOpenDraftIds)
    })

    it('should pass each draft id to the floating compose child', () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2']

      renderComponent()

      expect(mockFloatingCompose).toHaveBeenCalledTimes(2)
      expect(mockFloatingCompose).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ draftId: 'draft-1' })
      )
      expect(mockFloatingCompose).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ draftId: 'draft-2' })
      )
    })
  })

  describe('custom styling', () => {
    it('should apply the floating stack layout classes to the wrapper', () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      const { container } = renderComponent()
      const wrapper = container.querySelector('div[class*="space-x-reverse"]')

      expect(wrapper).toHaveClass(
        'fixed',
        'right-14',
        'bottom-0',
        'z-(--z-floating-compose)',
        'flex',
        'flex-row-reverse',
        'items-end',
        '-space-x-32',
        'space-x-reverse',
        'pointer-events-none',
        'px-4'
      )
    })

    it('should not add inline styles to the wrapper', () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      const { container } = renderComponent()
      const wrapper = container.querySelector('div[class*="space-x-reverse"]')

      expect(wrapper).toHaveAttribute('class')
      expect(wrapper).not.toHaveAttribute('style')
    })
  })

  describe('accessibility', () => {
    it('should not introduce interactive roles by itself', () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2']

      renderComponent()

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('should render one mocked floating compose per open draft', () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2', 'draft-3']

      renderComponent()

      expect(screen.getAllByTestId('floating-compose')).toHaveLength(3)
    })

    it('should preserve the store order in the rendered children', () => {
      mockState.mailCompose.openDraftIds = ['draft-a', 'draft-b', 'draft-c']

      renderComponent()

      expect(
        screen
          .getAllByTestId('floating-compose')
          .map((node) => node.textContent)
      ).toEqual(['draft-a', 'draft-b', 'draft-c'])
    })
  })

  describe('component stability', () => {
    it('should remain consistent across re-renders with the same drafts', async () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2']

      const { rerender } = renderComponent()
      rerender(<FloatingComposeContainer />)

      await waitFor(() => {
        expect(screen.getAllByTestId('floating-compose')).toHaveLength(2)
      })
    })
  })

  describe('responsive layout', () => {
    it('should keep the same structural wrapper for a single draft', () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      const { container } = renderComponent()
      const wrapper = container.querySelector('div[class*="flex-row-reverse"]')

      expect(wrapper).toHaveClass('flex-row-reverse', 'items-end')
      expect(screen.getAllByTestId('floating-compose')).toHaveLength(1)
    })

    it('should keep the same structural wrapper for the maximum visible stack', () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2', 'draft-3']

      const { container } = renderComponent()
      const wrapper = container.querySelector('div[class*="-space-x-32"]')

      expect(wrapper).toHaveClass('-space-x-32', 'space-x-reverse')
      expect(screen.getAllByTestId('floating-compose')).toHaveLength(3)
    })
  })

  describe('children rendering', () => {
    it('should render multiple mapped children from the selector output', () => {
      mockState.mailCompose.openDraftIds = ['draft-1', 'draft-2']

      renderComponent()

      const children = screen.getAllByTestId('floating-compose')

      expect(children[0]).toHaveAttribute('data-draft-id', 'draft-1')
      expect(children[1]).toHaveAttribute('data-draft-id', 'draft-2')
    })

    it('should remove all mapped children when the selector becomes empty', async () => {
      mockState.mailCompose.openDraftIds = ['draft-1']

      const { rerender, container } = renderComponent()

      mockState.mailCompose.openDraftIds = []
      rerender(<FloatingComposeContainer />)

      await waitFor(() => {
        expect(screen.queryByTestId('floating-compose')).not.toBeInTheDocument()
        expect(container.firstChild).toBeNull()
      })
    })
  })

  describe('restoring current drafts', () => {
    const mockGetCurrentDrafts = jest.fn()
    const mockGetFolders = jest.fn()
    const mockGetMail = jest.fn()

    const runInit = async () => {
      renderComponent()
      await act(async () => {
        jest.advanceTimersByTime(2000)
        // Let the chained lazy queries of initDrafts settle.
        for (let i = 0; i < 10; i += 1) await Promise.resolve()
      })
    }

    beforeEach(() => {
      jest.useFakeTimers()
      ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: { id: 1 } })
      ;(useLazyGetCurrentDraftsQuery as jest.Mock).mockReturnValue([
        mockGetCurrentDrafts,
        { isLoading: false },
      ])
      ;(useLazyGetFoldersQuery as jest.Mock).mockReturnValue([
        mockGetFolders,
        { isLoading: false },
      ])
      ;(useLazyGetMailQuery as jest.Mock).mockReturnValue([
        mockGetMail,
        { isLoading: false },
      ])
      mockGetMail.mockResolvedValue({ data: undefined })
      mockGetFolders.mockResolvedValue({
        data: [
          { path: 'INBOX', type: 'INBOX', subfolders: [] },
          {
            path: 'INBOX/Brouillons',
            type: 'DRAFTS',
            subfolders: [],
          },
        ],
      })
    })

    afterEach(() => {
      jest.useRealTimers()
      ;(useProfile as jest.Mock).mockReturnValue({ mainAccount: null })
    })

    it('fetches drafts from the folder flagged as drafts', async () => {
      mockGetCurrentDrafts.mockResolvedValue({
        data: { data: [{ key: 'k1', mail_server_uid: '42' }] },
      })

      await runInit()

      expect(mockGetMail).toHaveBeenCalledTimes(1)
      expect(mockGetMail).toHaveBeenCalledWith({
        folder: 'INBOX/Brouillons',
        mailId: '42',
        accountId: '1',
      })
    })

    it('skips drafts that have no server uid', async () => {
      mockGetCurrentDrafts.mockResolvedValue({
        data: {
          data: [
            { key: 'k1', mail_server_uid: '' },
            { key: 'k2', mail_server_uid: '7' },
            { key: 'k3', mail_server_uid: '' },
          ],
        },
      })

      await runInit()

      expect(mockGetMail).toHaveBeenCalledTimes(1)
      expect(mockGetMail).toHaveBeenCalledWith(
        expect.objectContaining({ mailId: '7' })
      )
    })

    it('does not load folders when no draft has a server uid', async () => {
      mockGetCurrentDrafts.mockResolvedValue({
        data: { data: [{ key: 'k1', mail_server_uid: '' }] },
      })

      await runInit()

      expect(mockGetCurrentDrafts).toHaveBeenCalledWith({ accountId: '1' })
      expect(mockGetFolders).not.toHaveBeenCalled()
      expect(mockGetMail).not.toHaveBeenCalled()
    })

    it('does not fetch drafts when the account has no drafts folder', async () => {
      mockGetCurrentDrafts.mockResolvedValue({
        data: { data: [{ key: 'k1', mail_server_uid: '42' }] },
      })
      mockGetFolders.mockResolvedValue({
        data: [{ path: 'INBOX', type: 'INBOX', subfolders: [] }],
      })

      await runInit()

      expect(mockGetFolders).toHaveBeenCalledWith({ accountId: '1' }, true)
      expect(mockGetMail).not.toHaveBeenCalled()
    })
  })
})
