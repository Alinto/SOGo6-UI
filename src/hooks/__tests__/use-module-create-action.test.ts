import { renderHook } from '@testing-library/react'

const mockUseIsMobile = jest.fn()
const mockUseSidebar = jest.fn()
const mockUsePathname = jest.fn()
const mockUseProfile = jest.fn()
const mockUseAppSelector = jest.fn()
const mockComposeOnClick = jest.fn()
const mockEventOnClick = jest.fn()
const mockTaskOnClick = jest.fn()
const mockContactOnClick = jest.fn()

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => mockUseIsMobile(),
}))

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => mockUseSidebar(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    mockUseAppSelector(selector),
}))

jest.mock('@/features/mails/hooks/use-compose-action', () => ({
  useComposeAction: () => ({
    onClick: mockComposeOnClick,
    label: 'New message',
    icon: () => null,
  }),
}))

jest.mock('@/features/calendars/hooks/use-create-event-action', () => ({
  useCreateEventAction: () => ({
    onClick: mockEventOnClick,
    label: 'Create event',
    icon: () => null,
  }),
}))

jest.mock('@/features/tasks/hooks/use-create-task-action', () => ({
  useCreateTaskAction: () => ({
    onClick: mockTaskOnClick,
    label: 'New task',
    icon: () => null,
  }),
}))

jest.mock('@/features/address_books/hooks/use-create-contact-action', () => ({
  useCreateContactAction: () => ({
    onClick: mockContactOnClick,
    label: 'New contact',
    icon: () => null,
  }),
}))

import { useModuleCreateAction } from '../use-module-create-action'

const defaultState = {
  tasksUi: { isFormOpen: false },
  addressBooksUi: { isFormOpen: false, isListFormOpen: false },
}

describe('useModuleCreateAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseIsMobile.mockReturnValue(true)
    mockUseSidebar.mockReturnValue({ openMobile: false })
    mockUseProfile.mockReturnValue({
      moduleAccess: [],
      isLoading: false,
    })
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        ...defaultState,
        mailCompose: { openDraftIds: [] },
      })
    )
  })

  it('returns compose action on mail routes', () => {
    mockUsePathname.mockReturnValue('/u/0/INBOX')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current?.onClick).toBe(mockComposeOnClick)
    expect(result.current?.label).toBe('New message')
  })

  it('returns calendar action on calendar routes', () => {
    mockUsePathname.mockReturnValue('/calendars')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current?.onClick).toBe(mockEventOnClick)
  })

  it('returns task action on tasks routes', () => {
    mockUsePathname.mockReturnValue('/tasks')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current?.onClick).toBe(mockTaskOnClick)
  })

  it('returns contact action on address book routes', () => {
    mockUsePathname.mockReturnValue('/address_books/work')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current?.onClick).toBe(mockContactOnClick)
  })

  it('returns null on desktop', () => {
    mockUseIsMobile.mockReturnValue(false)
    mockUsePathname.mockReturnValue('/u/0/INBOX')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })

  it('returns null when mobile sidebar is open', () => {
    mockUseSidebar.mockReturnValue({ openMobile: true })
    mockUsePathname.mockReturnValue('/u/0/INBOX')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })

  it('returns null when compose draft is open on mail routes', () => {
    mockUsePathname.mockReturnValue('/u/0/INBOX')
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        ...defaultState,
        mailCompose: { openDraftIds: ['draft-1'] },
      })
    )
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })

  it('returns null when task form is open', () => {
    mockUsePathname.mockReturnValue('/tasks')
    mockUseAppSelector.mockImplementation((selector) =>
      selector({
        ...defaultState,
        tasksUi: { isFormOpen: true },
        mailCompose: { openDraftIds: [] },
      })
    )
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })

  it('returns null on contact detail view', () => {
    mockUsePathname.mockReturnValue('/address_books/work/contact-1')
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })

  it('returns null when module access denies mail', () => {
    mockUsePathname.mockReturnValue('/u/0/INBOX')
    mockUseProfile.mockReturnValue({
      moduleAccess: ['calendar'],
      isLoading: false,
    })
    const { result } = renderHook(() => useModuleCreateAction())
    expect(result.current).toBeNull()
  })
})
