import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '@/components/ui/dialog'

const mockExportAddressBook = jest.fn()
const mockStartJob = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../../../store/address-books-api', () => ({
  useExportAddressBookDocumentMutation: () => [
    mockExportAddressBook,
    { isLoading: false },
  ],
}))

jest.mock('../../../../hooks/use-contact-job-runner', () => ({
  useContactJobRunner: () => ({
    startJob: mockStartJob,
    isPolling: false,
    isSuccess: false,
  }),
}))

import ExportDialog from '../export-dialog'

describe('ExportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExportAddressBook.mockReturnValue({
      unwrap: () => Promise.resolve({ job_id: 'job-1' }),
    })
  })

  it('starts export job on submit', async () => {
    const user = userEvent.setup()
    render(
      <Dialog open>
        <ExportDialog bookId="work" bookName="Work" />
      </Dialog>
    )

    await user.click(screen.getByRole('button', { name: 'export.submit.string' }))

    expect(mockExportAddressBook).toHaveBeenCalledWith({
      bookId: 'work',
      format: 'vcard3',
    })
    expect(mockStartJob).toHaveBeenCalledWith(
      { job_id: 'job-1' },
      expect.objectContaining({
        operation: 'export',
        label: 'Work',
        format: 'vcard3',
      })
    )
  })
})
