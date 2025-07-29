import { TooltipProvider } from '@/components/ui/tooltip'
import MailActionsBar from '@/features/mails/components/mail/mail-action-bar'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const MockIcon = ({ label }) => (
  <svg aria-label={label}>
    <title>{label}</title>
  </svg>
)

describe('MailActionsBar', () => {
  const actions = [
    { icon: <MockIcon label="Icon1" />, title: 'Action 1' },
    { icon: <MockIcon label="Icon2" />, title: 'Action 2' },
    { icon: <MockIcon label="Icon3" />, title: undefined },
  ]

  it('renders all actions', () => {
    render(
      <TooltipProvider>
        <MailActionsBar actions={actions} />
      </TooltipProvider>
    )
    expect(screen.getAllByRole('button')).toHaveLength(3)
    expect(screen.getByLabelText('Icon1')).toBeInTheDocument()
    expect(screen.getByLabelText('Icon2')).toBeInTheDocument()
    expect(screen.getByLabelText('Icon3')).toBeInTheDocument()
  })

  it('shows the tooltip on hover', async () => {
    render(
      <TooltipProvider>
        <MailActionsBar actions={actions} />
      </TooltipProvider>
    )
    const actionBtn = screen.getAllByRole('button')[0]
    await userEvent.hover(actionBtn)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Action 1')
  })

  it('does not show tooltip if title is undefined', async () => {
    render(
      <TooltipProvider>
        <MailActionsBar actions={actions} />
      </TooltipProvider>
    )
    const actionBtn = screen.getAllByRole('button')[2]
    await userEvent.hover(actionBtn)
    // Il ne doit pas y avoir de tooltip affiché
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
