import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import { InputWithIcon } from '../input-with-icon'

// filepath: /SOGo/src/components/ui/input-with-icon.test.tsx

describe('InputWithIcon component', () => {
  it('matches snapshot', () => {
    const { asFragment } = render(
      <InputWithIcon ActionComponent={<span>Icon</span>} />
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders InputWithIcon component', () => {
    const { container } = render(
      <InputWithIcon ActionComponent={<span>Icon</span>} />
    )
    expect(container.firstChild).toHaveClass('relative')
  })

  it('renders Input component inside InputWithIcon', () => {
    const { getByRole } = render(
      <InputWithIcon ActionComponent={<span>Icon</span>} />
    )
    expect(getByRole('textbox')).toBeInTheDocument()
  })

  it('renders Button component with ActionComponent inside InputWithIcon', () => {
    const { getByRole, getByText } = render(
      <InputWithIcon ActionComponent={<span>Icon</span>} />
    )
    expect(getByRole('button')).toBeInTheDocument()
    expect(getByText('Icon')).toBeInTheDocument()
  })

  it('applies custom props to Input component', () => {
    const { getByRole } = render(
      <InputWithIcon
        ActionComponent={<span>Icon</span>}
        placeholder="Enter text"
      />
    )
    expect(getByRole('textbox')).toHaveAttribute('placeholder', 'Enter text')
  })

  it('applies custom className to Button component', () => {
    const { getByRole } = render(
      <InputWithIcon ActionComponent={<span>Icon</span>} />
    )
    expect(getByRole('button')).toHaveClass('absolute right-0 top-0')
  })

  it('calls onActionClick when Button is clicked', () => {
    const onActionClick = jest.fn()
    const { getByRole } = render(
      <InputWithIcon
        ActionComponent={<span>Icon</span>}
        onActionClick={onActionClick}
      />
    )
    fireEvent.click(getByRole('button'))
    expect(onActionClick).toHaveBeenCalledTimes(1)
  })
})
