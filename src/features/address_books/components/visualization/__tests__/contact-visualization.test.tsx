import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { VCard } from '../../../address-books-types'

jest.mock('next/navigation', () => ({
  useParams: () => ({ book_id: 'work', contact_id: 'c1' }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('../contact-actions', () => ({
  __esModule: true,
  default: ({
    emails,
    displayName,
  }: {
    emails?: string[]
    displayName?: string
  }) => (
    <div data-testid="contact-actions">
      {displayName}:{emails?.join(',')}
    </div>
  ),
}))

jest.mock('../email-item', () => ({
  EmailItem: ({ email, displayName }: { email: string; displayName?: string }) => (
    <div data-testid="email-item">
      {email}:{displayName}
    </div>
  ),
}))

jest.mock('../note-field', () => ({
  NoteField: () => <div data-testid="note-field" />,
}))

import ContactVisualization from '../contact-visualization'

const contact: VCard = {
  id: 'c1',
  version: '4.0',
  firstName: 'John',
  lastName: 'Doe',
  emails: ['john@example.com'],
  phoneNumbers: ['+33123456789'],
}

describe('ContactVisualization', () => {
  it('renders contact sections and passes props to actions', () => {
    render(<ContactVisualization data={contact} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByTestId('contact-actions')).toHaveTextContent(
      'John Doe:john@example.com'
    )
    expect(screen.getByTestId('email-item')).toHaveTextContent(
      'john@example.com:John Doe'
    )
    expect(screen.getByTestId('note-field')).toBeInTheDocument()
  })
})
