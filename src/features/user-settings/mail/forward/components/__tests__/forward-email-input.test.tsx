import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ForwardEmailInput from '../forward-email-input'

jest.mock('@/features/user-settings/components/tagged-email-input', () => ({
  __esModule: true,
  default: ({
    translationNamespace,
    testId,
    tags,
  }: {
    translationNamespace: string
    testId?: string
    tags: { id: string; value: string }[]
  }) => (
    <div
      data-testid={testId}
      data-namespace={translationNamespace}
      data-tags-count={tags.length}
    />
  ),
}))

describe('ForwardEmailInput', () => {
  const defaultProps = {
    tags: [{ id: '1', value: 'forward@example.com' }],
    remove: jest.fn(),
    handleAdd: jest.fn(),
    name: 'forwardAddresses',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders TaggedEmailInput with forward namespace', () => {
    render(<ForwardEmailInput {...defaultProps} />)

    const input = screen.getByTestId('forward-email-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('data-namespace', 'US_MAIL_FORWARD')
  })

  it('forwards tags and props to TaggedEmailInput', () => {
    render(<ForwardEmailInput {...defaultProps} maxTags={5} disabled />)

    expect(screen.getByTestId('forward-email-input')).toHaveAttribute(
      'data-tags-count',
      '1'
    )
  })
})
