import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import MailListSkeleton from '../list-skeleton'

describe('MailListSkeleton Component', () => {
  it('renders the MailListSkeleton component', () => {
    render(<MailListSkeleton />)
    const skeleton = document.querySelector('.flex.w-full.flex-col')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders the correct number of row skeletons', () => {
    render(<MailListSkeleton />)
    const rows = document.querySelectorAll('.flex.items-center.gap-4.px-6.py-3')
    expect(rows.length).toBe(16)
  })
})
