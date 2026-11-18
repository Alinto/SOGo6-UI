import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockExportCalendar = jest.fn()
const mockFetchJobResult = jest.fn()
const mockDownloadBlobAsFile = jest.fn()
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
  useExportCalendarMutation: () => [mockExportCalendar, { isLoading: false }],
}))

jest.mock('@/features/jobs', () => ({
  useJobPolling: (_jobId: string | null, options: typeof pollingOptions) => {
    pollingOptions = options
    return { isPolling: false }
  },
  useLazyGetJobResultQuery: () => [mockFetchJobResult],
  downloadBlobAsFile: (...args: unknown[]) => mockDownloadBlobAsFile(...args),
  filenameFromContentDisposition: (_header: string | null, fallback: string) =>
    fallback,
}))

import ExportAction, { icsFallbackFilename } from '../export'

describe('icsFallbackFilename', () => {
  it('turns the calendar name into an ics filename', () => {
    expect(icsFallbackFilename('Team calendar', 'cal-1')).toBe(
      'Team_calendar.ics'
    )
  })

  it('keeps an existing ics extension', () => {
    expect(icsFallbackFilename('holidays.ics', 'cal-1')).toBe('holidays.ics')
  })
})

describe('ExportAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    pollingOptions = {}
    mockExportCalendar.mockReturnValue({
      unwrap: () => Promise.resolve({ job_id: 'job-1' }),
    })
    mockFetchJobResult.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          blob: new Blob(['BEGIN:VCALENDAR']),
          contentType: 'text/calendar',
          contentDisposition: null,
        }),
    })
  })

  it('enqueues the export and downloads the file when the job succeeds', async () => {
    const user = userEvent.setup()
    render(<ExportAction calendarKey="cal-1" name="Team calendar" />)

    await user.click(
      screen.getByRole('button', { name: 'sidebar.export.submit.string' })
    )

    expect(
      await screen.findByText('sidebar.export.processing.string')
    ).toBeInTheDocument()

    pollingOptions.onSuccess?.()

    await waitFor(() => {
      expect(mockFetchJobResult).toHaveBeenCalledWith({
        jobId: 'job-1',
        download: true,
      })
    })
    await waitFor(() => {
      expect(mockDownloadBlobAsFile).toHaveBeenCalledWith(
        expect.any(Blob),
        'Team_calendar.ics'
      )
    })
    expect(
      await screen.findByText('sidebar.export.success.string')
    ).toBeInTheDocument()
  })

  it('shows an error when the export cannot be enqueued', async () => {
    mockExportCalendar.mockReturnValue({
      unwrap: () => Promise.reject(new Error('nope')),
    })
    const user = userEvent.setup()
    render(<ExportAction calendarKey="cal-1" name="Team calendar" />)

    await user.click(
      screen.getByRole('button', { name: 'sidebar.export.submit.string' })
    )

    expect(
      await screen.findByText('sidebar.export.error.string')
    ).toBeInTheDocument()
  })
})
