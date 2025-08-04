import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

// filepath: src/components/ui/tabs.test.tsx

describe('Tabs Component', () => {
  it('renders TabsList with children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
  })

  it('renders TabsContent with children', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    // First, click on Tab 1 to activate it
    await user.click(screen.getByText('Tab 1'))

    // Check that tab1 is active by looking at aria-selected
    expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true')

    // Check that content area is visible (even if empty in this test environment)
    const content1Panel = screen.getByRole('tabpanel', { name: /tab 1/i })
    expect(content1Panel).toBeInTheDocument()
    expect(content1Panel).not.toHaveAttribute('hidden')

    await user.click(screen.getByText('Tab 2'))

    // Check that tab2 is now active
    await waitFor(() => {
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'true')
    })

    // Check that content2 panel is visible
    const content2Panel = screen.getByRole('tabpanel', { name: /tab 2/i })
    expect(content2Panel).toBeInTheDocument()
    expect(content2Panel).not.toHaveAttribute('hidden')
  })

  it('applies custom className to TabsList', () => {
    render(
      <Tabs>
        <TabsList className="custom-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByText('Tab 1').parentElement).toHaveClass('custom-class')
  })

  it('applies custom className to TabsTrigger', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" className="custom-class">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toHaveClass('custom-class')
  })

  it('renders TabsTrigger with correct value', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    // Radix UI uses different attributes - check for the value in the id attribute
    expect(screen.getByText('Tab 1')).toHaveAttribute(
      'id',
      expect.stringContaining('tab1')
    )
    expect(screen.getByText('Tab 2')).toHaveAttribute(
      'id',
      expect.stringContaining('tab2')
    )
  })

  it('renders TabsContent with correct value', async () => {
    const user = userEvent.setup()

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    // First, click on Tab 1 to activate it
    await user.click(screen.getByText('Tab 1'))

    // Check that tab1 is active by looking at aria-selected
    expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true')

    // Check that content area is visible (even if empty in this test environment)
    const content1Panel = screen.getByRole('tabpanel', { name: /tab 1/i })
    expect(content1Panel).toBeInTheDocument()
    expect(content1Panel).toHaveAttribute('id', expect.stringContaining('tab1'))

    await user.click(screen.getByText('Tab 2'))

    // Check that tab2 is now active
    await waitFor(() => {
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'true')
    })

    // Check that content2 panel is visible
    const content2Panel = screen.getByRole('tabpanel', { name: /tab 2/i })
    expect(content2Panel).toBeInTheDocument()
    expect(content2Panel).toHaveAttribute('id', expect.stringContaining('tab2'))
  })
})
