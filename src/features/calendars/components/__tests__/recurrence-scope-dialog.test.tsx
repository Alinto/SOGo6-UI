import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { RecurrenceScopeDialog } from '../recurrence-scope-dialog'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('RecurrenceScopeDialog', () => {
  it('renders three scope buttons when open', () => {
    render(
      <RecurrenceScopeDialog
        open
        mode="edit"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.getByText('recurrenceScope.ONE')).toBeInTheDocument()
    expect(screen.getByText('recurrenceScope.THISANDFUTURE')).toBeInTheDocument()
    expect(screen.getByText('recurrenceScope.ALL')).toBeInTheDocument()
  })

  it('calls onSelect with correct scope on click', () => {
    const onSelect = jest.fn()
    render(
      <RecurrenceScopeDialog
        open
        mode="edit"
        onSelect={onSelect}
        onCancel={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('recurrenceScope.ONE'))
    expect(onSelect).toHaveBeenCalledWith('ONE')
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = jest.fn()
    render(
      <RecurrenceScopeDialog
        open
        mode="delete"
        onSelect={jest.fn()}
        onCancel={onCancel}
      />
    )
    fireEvent.click(screen.getByText('recurrenceScope.cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('does not render content when closed', () => {
    render(
      <RecurrenceScopeDialog
        open={false}
        mode="edit"
        onSelect={jest.fn()}
        onCancel={jest.fn()}
      />
    )
    expect(screen.queryByText('recurrenceScope.ONE')).not.toBeInTheDocument()
  })
})
