import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from '@/components/ui/dialog'

const mockImportContacts = jest.fn()
const mockCancelJob = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../../../store/address-books-api', () => ({
  useImportAddressBookDocumentMutation: () => [jest.fn(), { isLoading: false }],
  useImportContactsDocumentMutation: () => [
    mockImportContacts,
    { isLoading: false },
  ],
  useImportListsDocumentMutation: () => [jest.fn(), { isLoading: false }],
}))

jest.mock('../../../../hooks/use-contact-job-runner', () => ({
  useContactJobRunner: () => ({
    startJob: jest.fn(),
    isPolling: true,
    isSuccess: false,
    statusMessage: null,
    cancelJob: mockCancelJob,
    isCancelling: false,
  }),
}))

import ImportDialog from '../import-dialog'

describe('ImportDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows cancel button while import job is polling', async () => {
    const user = userEvent.setup()
    render(
      <Dialog open>
        <ImportDialog bookId="work" bookName="Work" />
      </Dialog>
    )

    await user.click(screen.getByTestId('import-cancel-button'))
    expect(mockCancelJob).toHaveBeenCalled()
  })
})
