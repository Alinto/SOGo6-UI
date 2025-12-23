import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import MailDetailSkeleton from '../skeleton'

describe('MailDetailSkeleton Component', () => {
  it('renders the MailDetailSkeleton component', () => {
    const { container } = render(<MailDetailSkeleton />)
    const skeleton = container.querySelector('.w-full')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders the correct number of action skeletons', () => {
    const { container } = render(<MailDetailSkeleton />)
    const actionSkeletons = container.querySelectorAll('.h-8.w-8.rounded-full')
    expect(actionSkeletons.length).toBe(7)
  })
})
