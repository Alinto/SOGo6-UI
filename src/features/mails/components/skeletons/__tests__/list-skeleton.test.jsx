import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import ListSkeleton from '../list-skeleton'

// filepath: src/features/address_books/components/list-skeleton.test.tsx

describe('ListSkeleton Component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(<ListSkeleton />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders the ListSkeleton component', () => {
    render(<ListSkeleton />)
    expect(screen.getByRole('list-skeleton')).toBeInTheDocument()
  })

  it('renders the correct number of AddressBookListSkeleton components', () => {
    render(<ListSkeleton />)
    const skeletons = screen.getAllByRole('item-skeleton', {
      displayName: /skeleton/i,
    })
    expect(skeletons).toHaveLength(5)
  })

  it('applies the correct class names to the container', () => {
    render(<ListSkeleton />)
    const container = screen.getByRole('list-skeleton')
    expect(container).toHaveClass(
      'flex flex-col w-full md:w-1/2 lg:w-2/5 p-4 rounded'
    )
  })

  it('renders the header with the correct classnames', () => {
    render(<ListSkeleton />)
    const header = screen.getByRole('header-skeleton')
    expect(header).toHaveClass(
      'flex flex-row items-center justify-between text-gray-500'
    )
  })
  it('renders the header item with the correct classnames', () => {
    render(<ListSkeleton />)
    const header = screen.getAllByRole('header-item-skeleton', {
      displayName: /skeleton/i,
    })
    header.forEach((item) => {
      expect(item).toHaveClass('h-6 w-1/8')
    })
  })
})
