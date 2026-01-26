import { render, screen } from '@testing-library/react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import WorkInProgress from '../work-in-progress'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'workInProgress.description.string':
        'This feature is currently under development.',
      'workInProgress.message.string':
        "We're working hard to bring you this feature.",
      'workInProgress.comingSoon.string': 'Coming soon! Stay tuned.',
    }

    return translations[key] || key
  },
}))

const renderComponent = (props: { title: string; description?: string }) =>
  render(
    <Dialog open>
      <DialogContent>
        <WorkInProgress {...props} />
      </DialogContent>
    </Dialog>
  )

describe('WorkInProgress', () => {
  it('renders title', () => {
    renderComponent({ title: 'Test Feature' })

    expect(screen.getByText('Test Feature')).toBeInTheDocument()
  })

  it('shows default description when none is provided', () => {
    renderComponent({ title: 'Test Feature' })

    expect(
      screen.getByText('This feature is currently under development.')
    ).toBeInTheDocument()
  })

  it('shows custom description when provided', () => {
    renderComponent({
      title: 'Test Feature',
      description: 'Custom description',
    })

    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })
})
