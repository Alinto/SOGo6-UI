import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()
const mockCopy = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../hooks/use-copy-to-clipboard', () => ({
  useCopyToClipboard: () => ({ copyToClipboard: mockCopy }),
}))

import { EmailItem } from '../email-item'

describe('EmailItem', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dispatches createDraft when compose is clicked', async () => {
    const user = userEvent.setup()
    render(<EmailItem email="john@example.com" displayName="John Doe" />)

    await user.click(screen.getByTestId('compose-email-john@example.com'))

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('createDraft'),
      })
    )
  })
})
