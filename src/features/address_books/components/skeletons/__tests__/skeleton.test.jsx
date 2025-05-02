import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import AddressBookListSkeleton from '../skeleton'

// filepath: src/features/address_books/components/skeletons/skeleton.test.tsx

describe('AddressBookListSkeleton Component', () => {
  it('renders the AddressBookListSkeleton component', () => {
    render(<AddressBookListSkeleton />)
    const skeleton = screen.getByRole('item-skeleton')
    expect(skeleton).toBeInTheDocument()
  })

  it('applies the correct class name to the Skeleton component', () => {
    render(<AddressBookListSkeleton />)
    const skeleton = screen.getByRole('item-skeleton')
    expect(skeleton).toHaveClass(
      'flex h-14 flex-row items-center my-1 gap-2 p-2 rounded-full'
    )
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(<AddressBookListSkeleton />)
    expect(asFragment()).toMatchSnapshot()
  })
})
