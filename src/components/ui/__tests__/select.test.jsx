import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  // filepath: src/components/ui/select.test.tsx
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '../select'

describe('Select Component', () => {
  it('renders SelectTrigger with children', () => {
    render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
      </Select>
    )
    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })
  it('matches snapshot', () => {
    const { asFragment } = render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Label</SelectLabel>
            <SelectItem>Item 1</SelectItem>
            <SelectItem>Item 2</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders SelectContent with children', () => {
    render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
        <SelectContent>
          <SelectItem>Item 1</SelectItem>
          <SelectItem>Item 2</SelectItem>
        </SelectContent>
      </Select>
    )
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })

  it('renders SelectItem with children', () => {
    render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
        <SelectContent>
          <SelectItem>Item 1</SelectItem>
        </SelectContent>
      </Select>
    )
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getByText('Item 1')).toBeInTheDocument()
  })

  it('renders SelectLabel with children', () => {
    render(
      <Select>
        <SelectTrigger>Trigger</SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Label</SelectLabel>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    fireEvent.click(screen.getByText('Trigger'))
    expect(screen.getByText('Label')).toBeInTheDocument()
  })
})
