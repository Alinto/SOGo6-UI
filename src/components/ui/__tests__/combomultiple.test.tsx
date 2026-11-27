import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MultiSelect } from '../combomultiple'

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn()
})

const coloredOptions = [
  { value: 'Work', label: 'Travail', color: '#8b5cf6' },
  { value: 'toto', label: 'toto', color: 'hsl(var(--primary))' },
]

describe('MultiSelect', () => {
  it('joins the selected labels without colors', () => {
    render(
      <MultiSelect
        options={[
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
        ]}
        selected={['a', 'b']}
        onChange={jest.fn()}
      />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('A, B')
    expect(screen.queryByTestId('multi-select-color-dot')).toBeNull()
  })

  it('shows a colored dot before each selected label', () => {
    render(
      <MultiSelect
        options={coloredOptions}
        selected={['Work', 'toto']}
        onChange={jest.fn()}
      />
    )
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveTextContent('Travail')
    expect(trigger).toHaveTextContent('toto')
    const dots = screen.getAllByTestId('multi-select-color-dot')
    expect(dots).toHaveLength(2)
    expect(dots[0]).toHaveStyle({ backgroundColor: '#8b5cf6' })
  })

  it('shows the placeholder when nothing is selected', () => {
    render(
      <MultiSelect
        options={coloredOptions}
        selected={[]}
        onChange={jest.fn()}
        placeholder="Pick"
      />
    )
    expect(screen.getByRole('combobox')).toHaveTextContent('Pick')
    expect(screen.queryByTestId('multi-select-color-dot')).toBeNull()
  })

  it('shows the colors in the option list and selects by value', () => {
    const onChange = jest.fn()
    render(
      <MultiSelect options={coloredOptions} selected={[]} onChange={onChange} />
    )
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getAllByTestId('multi-select-color-dot')).toHaveLength(2)
    fireEvent.click(screen.getByText('Travail'))
    expect(onChange).toHaveBeenCalledWith(['Work'])
  })
})
