import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import ShareUserPicker from '../share-user-picker'

const mockFieldProps = jest.fn()

// Stands in for the autocomplete: "pick" simulates choosing an entry returned
// by the contacts autocomplete API, "type" simulates free text reaching handleAdd.
jest.mock(
  '@/features/address_books/components/recipient-autocomplete-field',
  () => ({
    __esModule: true,
    default: (props: {
      handleAdd: (
        value: string,
        suggestion?: { email: string; source: string }
      ) => void
    }) => {
      mockFieldProps(props)
      return (
        <div>
          <button
            type="button"
            onClick={() =>
              props.handleAdd('jdupont@alinto.eu', {
                email: 'jdupont@alinto.eu',
                source: 'contact',
              })
            }
          >
            pick
          </button>
          <button
            type="button"
            onClick={() => props.handleAdd('free@text.com')}
          >
            type
          </button>
        </div>
      )
    },
  })
)

const defaultProps = {
  label: 'Add a user',
  placeholder: 'Search by name or email…',
  loadingLabel: 'Searching users…',
  duplicateError: 'This user already has access.',
}

describe('ShareUserPicker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('configures the field to only accept contacts autocomplete entries', () => {
    render(
      <ShareUserPicker
        {...defaultProps}
        isDuplicate={() => false}
        onAdd={jest.fn()}
      />
    )

    expect(screen.getByText('Add a user')).toBeInTheDocument()
    expect(mockFieldProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tags: [],
        suggestionsOnly: true,
        placeholder: 'Search by name or email…',
        loadingLabel: 'Searching users…',
      })
    )
  })

  it('adds the user as soon as a suggestion is picked', () => {
    const onAdd = jest.fn()
    render(
      <ShareUserPicker
        {...defaultProps}
        isDuplicate={() => false}
        onAdd={onAdd}
      />
    )

    fireEvent.click(screen.getByText('pick'))

    expect(onAdd).toHaveBeenCalledWith({
      uid: 'jdupont@alinto.eu',
      email: 'jdupont@alinto.eu',
    })
  })

  it('ignores values that do not come from a suggestion', () => {
    const onAdd = jest.fn()
    render(
      <ShareUserPicker
        {...defaultProps}
        isDuplicate={() => false}
        onAdd={onAdd}
      />
    )

    fireEvent.click(screen.getByText('type'))
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows the duplicate error instead of adding an existing user', () => {
    const onAdd = jest.fn()
    const isDuplicate = jest.fn(() => true)
    render(
      <ShareUserPicker
        {...defaultProps}
        isDuplicate={isDuplicate}
        onAdd={onAdd}
      />
    )

    fireEvent.click(screen.getByText('pick'))

    expect(onAdd).not.toHaveBeenCalled()
    expect(
      screen.getByText('This user already has access.')
    ).toBeInTheDocument()

    // The error goes away once a new user is added.
    isDuplicate.mockReturnValue(false)
    fireEvent.click(screen.getByText('pick'))
    expect(onAdd).toHaveBeenCalled()
    expect(
      screen.queryByText('This user already has access.')
    ).not.toBeInTheDocument()
  })
})
