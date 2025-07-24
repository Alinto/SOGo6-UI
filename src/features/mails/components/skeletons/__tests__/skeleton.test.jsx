import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import MailDetailSkeleton from '../skeleton'

describe('MailDetailSkeleton Component', () => {
  it('renders the MailDetailSkeleton component', () => {
    render(<MailDetailSkeleton />)
    const skeleton = document.querySelector('.w-full.p-0.sm\\:p-0')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders the correct number of action skeletons', () => {
    render(<MailDetailSkeleton />)
    const actionSkeletons = document.querySelectorAll('.h-8.w-8.rounded-full')
    expect(actionSkeletons.length).toBe(7)
  })
})
