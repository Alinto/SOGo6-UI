import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../collapsible'

// filepath: src/components/ui/collapsible.test.tsx

describe('Collapsible Component', () => {
  it('renders the CollapsibleTrigger and CollapsibleContent', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
      </Collapsible>
    )

    expect(screen.getByText('Toggle Content')).toBeInTheDocument()
  })

  it('toggles the CollapsibleContent visibility on trigger click', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
        <CollapsibleContent>Collapsible Content</CollapsibleContent>
      </Collapsible>
    )

    const trigger = screen.getByText('Toggle Content')

    // Click the trigger to show the content
    fireEvent.click(trigger)
    const content = screen.getByText('Collapsible Content')
    expect(content).toBeVisible()

    // Click the trigger again to hide the content
    fireEvent.click(trigger)
    expect(content).not.toBeVisible()
  })

  it('applies custom className to CollapsibleContent', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
        <CollapsibleContent className="custom-class">
          Collapsible Content
        </CollapsibleContent>
      </Collapsible>
    )
    const trigger = screen.getByText('Toggle Content')
    // Click the trigger to show the content
    fireEvent.click(trigger)
    const content = screen.getByText('Collapsible Content')
    expect(content).toHaveClass('custom-class')
  })

  it('forwards additional props to the CollapsibleContent', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
        <CollapsibleContent data-testid="collapsible-content">
          Collapsible Content
        </CollapsibleContent>
      </Collapsible>
    )

    const content = screen.getByTestId('collapsible-content')
    expect(content).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Collapsible>
        <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
        <CollapsibleContent>Collapsible Content</CollapsibleContent>
      </Collapsible>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
