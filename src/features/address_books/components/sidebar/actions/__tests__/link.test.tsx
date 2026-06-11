import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockCopy = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/address_books/utils/address-book-url', () => ({
  buildAddressBookDavUrl: (id: string) => `https://example.com/SOGo/dav/addressbooks/${id}/`,
}))

jest.mock('@/features/address_books/components/visualization/hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: mockCopy }),
}))

import { Dialog, DialogContent } from '@/components/ui/dialog'
import LinkAction from '../link'

describe('LinkAction', () => {
  it('renders the CardDAV URL and copies on button click', async () => {
    const user = userEvent.setup()
    render(
      <Dialog open>
        <DialogContent>
          <LinkAction name="Work" id="work" />
        </DialogContent>
      </Dialog>
    )

    const input = screen.getByTestId('address-book-dav-url') as HTMLInputElement
    expect(input.value).toBe('https://example.com/SOGo/dav/addressbooks/work/')

    await user.click(screen.getByTestId('copy-address-book-url'))
    expect(mockCopy).toHaveBeenCalled()
  })
})
