import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'

// filepath: src/components/ui/tabs.test.tsx

describe('Tabs Component', () => {
  it('renders TabsList with children', () => {
    render(
      <Tabs>
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

  it('renders TabsContent with children', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    fireEvent.click(screen.getByText('Tab 1'))
    expect(screen.getByText('Content 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeInTheDocument()
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
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>
    )

    expect(screen.getByText('Tab 1')).toHaveAttribute('data-value', 'tab1')
    expect(screen.getByText('Tab 2')).toHaveAttribute('data-value', 'tab2')
  })

  it('renders TabsContent with correct value', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    )

    fireEvent.click(screen.getByText('Tab 1'))
    expect(screen.getByText('Content 1')).toHaveAttribute('data-value', 'tab1')

    fireEvent.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toHaveAttribute('data-value', 'tab2')
  })
})
