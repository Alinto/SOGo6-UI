import '@testing-library/jest-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockImportCalendar = jest.fn()
const mockDispatch = jest.fn()
const mockInvalidateTags = jest.fn(() => ({ type: 'invalidate' }))
let pollingOptions: { onSuccess?: () => void; onFailure?: () => void } = {}

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { name?: string }) =>
    values?.name ? `${key}:${values.name}` : key,
}))

jest.mock('@/components/ui/dialog', () => ({
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useImportCalendarMutation: () => [mockImportCalendar, { isLoading: false }],
}))

jest.mock('@/features/jobs', () => ({
  useJobPolling: (_jobId: string | null, options: typeof pollingOptions) => {
    pollingOptions = options
    return { isPolling: false }
  },
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  CALENDAR_EVENTS_SLICE: 'calendar_events',
  apiSlice: {
    util: {
      invalidateTags: (...args: unknown[]) => mockInvalidateTags(...args),
    },
  },
}))

import ImportAction from '../import'

describe('ImportAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pollingOptions = {}
    mockImportCalendar.mockReturnValue({
      unwrap: () => Promise.resolve({ job_id: 'job-1' }),
    })
  })

  it('enqueues the import and refreshes events when the job succeeds', async () => {
    const user = userEvent.setup()
    const file = new File(['BEGIN:VCALENDAR'], 'events.ics', {
      type: 'text/calendar',
    })
    render(<ImportAction calendarKey="cal-1" name="Team" />)

    await user.upload(screen.getByLabelText('sidebar.import.file.string'), file)
    await user.click(
      screen.getByRole('button', { name: 'sidebar.import.submit.string' })
    )

    await waitFor(() =>
      expect(mockImportCalendar).toHaveBeenCalledWith({
        calendarKey: 'cal-1',
        file,
      })
    )

    await act(async () => {
      pollingOptions.onSuccess?.()
    })
    expect(mockInvalidateTags).toHaveBeenCalledWith(['calendar_events'])
    expect(
      await screen.findByText('sidebar.import.success.string')
    ).toBeInTheDocument()
  })

  it('does not enqueue an import without a file', async () => {
    const user = userEvent.setup()
    render(<ImportAction calendarKey="cal-1" name="Team" />)
    expect(
      screen.getByRole('button', { name: 'sidebar.import.submit.string' })
    ).toBeDisabled()
    await user.click(
      screen.getByRole('button', { name: 'sidebar.import.submit.string' })
    )
    expect(mockImportCalendar).not.toHaveBeenCalled()
  })
})
