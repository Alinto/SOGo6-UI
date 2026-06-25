import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUpdateVCard = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../../../store/address-books-api', () => ({
  useUpdateVCardMutation: () => [
    mockUpdateVCard,
    { isLoading: false },
  ],
}))

import { NoteField } from '../note-field'

describe('NoteField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateVCard.mockReturnValue({
      unwrap: () => Promise.resolve({ note: 'Updated note' }),
    })
  })

  it('starts in edit mode when note is empty', () => {
    render(<NoteField contactId="c1" bookId="work" />)
    expect(screen.getByPlaceholderText('notes.string')).toBeInTheDocument()
  })

  it('disables edit button when readOnly', () => {
    render(
      <NoteField contactId="c1" bookId="work" note="Hello" readOnly />
    )
    expect(
      screen.getByRole('button', { name: 'edit_note.string' })
    ).toBeDisabled()
  })

  it('saves edited note', async () => {
    const user = userEvent.setup()
    render(<NoteField contactId="c1" bookId="work" note="Hello" />)

    await user.click(screen.getByRole('button', { name: 'edit_note.string' }))
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Updated note' },
    })
    await user.click(screen.getByRole('button', { name: 'save.string' }))

    await waitFor(() => {
      expect(mockUpdateVCard).toHaveBeenCalledWith({
        id: 'c1',
        book_id: 'work',
        note: 'Updated note',
      })
    })
    expect(screen.queryByRole('button', { name: 'save.string' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'edit_note.string' })).toBeInTheDocument()
  })
})
