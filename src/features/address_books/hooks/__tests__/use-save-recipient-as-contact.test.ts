import { act, renderHook } from '@testing-library/react'

const mockUseGetAddressBooksQuery = jest.fn()
const mockAddContact = jest.fn()

jest.mock('../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
  useAddVCardToAddressBookMutation: () => [mockAddContact],
}))

import { useSaveRecipientAsContact } from '../use-save-recipient-as-contact'

describe('useSaveRecipientAsContact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAddContact.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    mockUseGetAddressBooksQuery.mockReturnValue({
      data: {
        personals: [
          { id: 'work', default: false },
          { id: 'personal', default: true },
        ],
        subscriptions: [],
        globals: [],
      },
    })
  })

  it('creates the contact in the default personal address book', async () => {
    const { result } = renderHook(() => useSaveRecipientAsContact())

    await act(async () => {
      await result.current.saveAsContact(' jane.doe@example.com ')
    })

    expect(mockAddContact).toHaveBeenCalledWith({
      id: 'personal',
      vCard: {
        version: '4.0',
        kind: 'individual',
        firstName: 'jane.doe',
        lastName: '',
        emails: ['jane.doe@example.com'],
      },
    })
    expect(result.current.canSaveAsContact).toBe(true)
  })

  it('does nothing when no personal address book is available', async () => {
    mockUseGetAddressBooksQuery.mockReturnValue({ data: undefined })
    const { result } = renderHook(() => useSaveRecipientAsContact())

    await act(async () => {
      await result.current.saveAsContact('jane@example.com')
    })

    expect(mockAddContact).not.toHaveBeenCalled()
    expect(result.current.canSaveAsContact).toBe(false)
  })

  it('swallows API errors (surfaced by the mutation notifications)', async () => {
    mockAddContact.mockReturnValue({
      unwrap: () => Promise.reject(new Error('boom')),
    })
    const { result } = renderHook(() => useSaveRecipientAsContact())

    await expect(
      act(async () => {
        await result.current.saveAsContact('jane@example.com')
      })
    ).resolves.not.toThrow()
  })
})
