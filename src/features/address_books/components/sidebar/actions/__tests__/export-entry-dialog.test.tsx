import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockExportContact = jest.fn()
const mockExportList = jest.fn()
const mockStartJob = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../../../store/address-books-api', () => ({
  useExportContactDocumentMutation: () => [
    mockExportContact,
    { isLoading: false },
  ],
  useExportListDocumentMutation: () => [mockExportList, { isLoading: false }],
}))

jest.mock('../../../../hooks/use-contact-job-runner', () => ({
  useContactJobRunner: () => ({
    startJob: mockStartJob,
    isPolling: false,
    isSuccess: false,
  }),
}))

import ExportEntryDialog from '../export-entry-dialog'

describe('ExportEntryDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExportContact.mockReturnValue({
      unwrap: () => Promise.resolve({ job_id: 'job-contact' }),
    })
    mockExportList.mockReturnValue({
      unwrap: () => Promise.resolve({ job_id: 'job-list' }),
    })
  })

  it('exports a contact when kind is individual', async () => {
    const user = userEvent.setup()
    render(
      <ExportEntryDialog
        open
        onOpenChange={jest.fn()}
        bookId="work"
        entryId="c1"
        entryLabel="John Doe"
        kind="individual"
      />
    )

    await user.click(screen.getByRole('button', { name: 'export.submit.string' }))

    expect(mockExportContact).toHaveBeenCalledWith({
      bookId: 'work',
      contactId: 'c1',
      format: 'vcard3',
    })
    expect(mockExportList).not.toHaveBeenCalled()
  })

  it('exports a distribution list when kind is group', async () => {
    const user = userEvent.setup()
    render(
      <ExportEntryDialog
        open
        onOpenChange={jest.fn()}
        bookId="work"
        entryId="list-1"
        entryLabel="Sales Team"
        kind="group"
      />
    )

    await user.click(screen.getByRole('button', { name: 'export.submit.string' }))

    expect(mockExportList).toHaveBeenCalledWith({
      bookId: 'work',
      listId: 'list-1',
      format: 'vcard3',
    })
    expect(mockExportContact).not.toHaveBeenCalled()
  })
})
