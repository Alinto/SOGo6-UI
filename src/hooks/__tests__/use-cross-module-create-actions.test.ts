import { renderHook } from '@testing-library/react'

const mockComposeOnClick = jest.fn()
const mockEventOnClick = jest.fn()
const mockTaskOnClick = jest.fn()
const mockContactOnClick = jest.fn()
const mockUseProfile = jest.fn()
const mockUseGetCalendarsQuery = jest.fn()
const mockContactDisabled = jest.fn()

jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: () => mockUseGetCalendarsQuery(),
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
    label: 'Create Event',
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
    disabled: mockContactDisabled(),
  }),
}))

import { useCrossModuleCreateActions } from '../use-cross-module-create-actions'

const writableCalendar = {
  name: 'Personal',
  description: null,
  key: 'cal-1',
  is_default: true,
}

describe('useCrossModuleCreateActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseProfile.mockReturnValue({ moduleAccess: [], isLoading: false })
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [writableCalendar],
      isLoading: false,
    })
    mockContactDisabled.mockReturnValue(false)
  })

  it('returns the requested primary and omits it from the menu', () => {
    const { result } = renderHook(() => useCrossModuleCreateActions('mail'))

    expect(result.current.primary?.id).toBe('mail')
    expect(result.current.primary?.onClick).toBe(mockComposeOnClick)
    expect(result.current.others.map((action) => action.id)).toEqual([
      'calendar',
      'contact',
      'task',
    ])
  })

  it('hides modules denied by module access', () => {
    mockUseProfile.mockReturnValue({
      moduleAccess: ['calendar'],
      isLoading: false,
    })
    const { result } = renderHook(() => useCrossModuleCreateActions('calendar'))

    expect(result.current.others.map((action) => action.id)).toEqual(['task'])
  })

  it('disables event and task when no writable calendar is available', () => {
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ name: 'Feed', description: null, source_type: 'ics' }],
      isLoading: false,
    })
    const { result } = renderHook(() => useCrossModuleCreateActions('mail'))

    const event = result.current.others.find(
      (action) => action.id === 'calendar'
    )
    const task = result.current.others.find((action) => action.id === 'task')
    expect(event?.disabled).toBe(true)
    expect(task?.disabled).toBe(true)
  })

  it('keeps contact disabled when the contact action is disabled', () => {
    mockContactDisabled.mockReturnValue(true)
    const { result } = renderHook(() => useCrossModuleCreateActions('mail'))

    expect(
      result.current.others.find((action) => action.id === 'contact')?.disabled
    ).toBe(true)
  })
})
