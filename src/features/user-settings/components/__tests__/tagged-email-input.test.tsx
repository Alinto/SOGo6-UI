import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaggedEmailInput from '../tagged-email-input'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/components/ui/tag', () => ({
  __esModule: true,
  default: ({
    value,
    action,
    'data-testid': testId,
  }: {
    value: string
    action: () => void
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <span>{value}</span>
      <button type="button" onClick={action}>
        Remove
      </button>
    </div>
  ),
}))

describe('TaggedEmailInput', () => {
  const defaultProps = {
    translationNamespace: 'US_MAIL_FORWARD',
    tags: [] as { id: string; value: string }[],
    remove: jest.fn(),
    handleAdd: jest.fn(),
    name: 'emails',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders input and existing tags', () => {
    render(
      <TaggedEmailInput
        {...defaultProps}
        tags={[
          { id: '1', value: 'a@example.com' },
          { id: '2', value: 'b@example.com' },
        ]}
      />
    )

    expect(screen.getByTestId('tagged-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-tag-0')).toHaveTextContent('a@example.com')
    expect(screen.getByTestId('email-tag-1')).toHaveTextContent('b@example.com')
    expect(screen.getByTestId('email-input-field')).toBeInTheDocument()
  })

  it('adds a valid email on Enter', async () => {
    const user = userEvent.setup()
    const handleAdd = jest.fn()

    render(<TaggedEmailInput {...defaultProps} handleAdd={handleAdd} />)

    await user.type(screen.getByTestId('email-input-field'), 'new@example.com')
    await user.keyboard('{Enter}')

    expect(handleAdd).toHaveBeenCalledWith('new@example.com')
    expect(screen.getByTestId('email-input-field')).toHaveValue('')
  })

  it('keeps the email in the input when handleAdd rejects it', async () => {
    const user = userEvent.setup()
    const handleAdd = jest.fn(() => false)

    render(<TaggedEmailInput {...defaultProps} handleAdd={handleAdd} />)

    const input = screen.getByTestId('email-input-field')
    await user.type(input, 'kept@example.com')
    await user.keyboard('{Enter}')

    expect(handleAdd).toHaveBeenCalledWith('kept@example.com')
    expect(input).toHaveValue('kept@example.com')
  })

  it('stops adding pasted emails at maxTags and keeps the rest in the input', async () => {
    const user = userEvent.setup()
    const handleAdd = jest.fn()

    render(
      <TaggedEmailInput
        {...defaultProps}
        handleAdd={handleAdd}
        maxTags={3}
        tags={[{ id: '1', value: 'a@example.com' }]}
      />
    )

    const input = screen.getByTestId('email-input-field')
    await user.click(input)
    await user.paste('b@example.com, c@example.com, d@example.com')

    expect(handleAdd).toHaveBeenCalledTimes(2)
    expect(handleAdd).toHaveBeenNthCalledWith(1, 'b@example.com')
    expect(handleAdd).toHaveBeenNthCalledWith(2, 'c@example.com')
    expect(input).toHaveValue('d@example.com')
  })

  it('adds an email only once when it is pasted twice', async () => {
    const user = userEvent.setup()
    const handleAdd = jest.fn()

    render(<TaggedEmailInput {...defaultProps} handleAdd={handleAdd} />)

    const input = screen.getByTestId('email-input-field')
    await user.click(input)
    await user.paste('b@example.com, B@example.com, c@example.com')

    expect(handleAdd).toHaveBeenCalledTimes(2)
    expect(handleAdd).toHaveBeenNthCalledWith(1, 'b@example.com')
    expect(handleAdd).toHaveBeenNthCalledWith(2, 'c@example.com')
    expect(input).toHaveValue('')
  })

  it('shows invalid email error for malformed input', async () => {
    const user = userEvent.setup()

    render(<TaggedEmailInput {...defaultProps} />)

    await user.type(screen.getByTestId('email-input-field'), 'not-an-email')
    await user.keyboard('{Enter}')

    expect(screen.getByText('errors.email.invalid.string')).toBeInTheDocument()
    expect(defaultProps.handleAdd).not.toHaveBeenCalled()
  })

  it('removes a tag when remove action is clicked', async () => {
    const user = userEvent.setup()
    const remove = jest.fn()

    render(
      <TaggedEmailInput
        {...defaultProps}
        remove={remove}
        tags={[{ id: '1', value: 'a@example.com' }]}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Remove' }))

    expect(remove).toHaveBeenCalledWith(0)
  })

  it('shows max reached message when tag limit is hit', () => {
    render(
      <TaggedEmailInput
        {...defaultProps}
        maxTags={1}
        tags={[{ id: '1', value: 'a@example.com' }]}
      />
    )

    expect(screen.getByText('errors.max_reached.string')).toBeInTheDocument()
    expect(screen.getByRole('group')).toHaveAttribute(
      'data-max-reached',
      'true'
    )
  })

  it('adds valid email on blur', async () => {
    const user = userEvent.setup()
    const handleAdd = jest.fn()

    render(<TaggedEmailInput {...defaultProps} handleAdd={handleAdd} />)

    const input = screen.getByTestId('email-input-field')
    await user.type(input, 'blur@example.com')
    await user.tab()

    await waitFor(() =>
      expect(handleAdd).toHaveBeenCalledWith('blur@example.com')
    )
  })
})
