import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../card'

// filepath: /SOGo/src/components/ui/card.test.tsx

describe('Card components', () => {
  it('matches snapshot for Card component', () => {
    const { asFragment } = render(<Card />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for CardHeader component', () => {
    const { asFragment } = render(<CardHeader />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for CardTitle component', () => {
    const { asFragment } = render(<CardTitle />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for CardDescription component', () => {
    const { asFragment } = render(<CardDescription />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for CardContent component', () => {
    const { asFragment } = render(<CardContent />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('matches snapshot for CardFooter component', () => {
    const { asFragment } = render(<CardFooter />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders Card component', () => {
    const { container } = render(<Card />)
    expect(container.firstChild).toHaveClass(
      'rounded-xl border bg-card text-card-foreground shadow'
    )
  })

  it('applies custom className to Card component', () => {
    const { container } = render(<Card className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside Card component', () => {
    const { getByText } = render(<Card>Card Content</Card>)
    expect(getByText('Card Content')).toBeInTheDocument()
  })

  it('renders CardHeader component', () => {
    const { container } = render(<CardHeader />)
    expect(container.firstChild).toHaveClass('flex flex-col space-y-1.5 p-6')
  })

  it('applies custom className to CardHeader component', () => {
    const { container } = render(<CardHeader className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside CardHeader component', () => {
    const { getByText } = render(<CardHeader>Card Header Content</CardHeader>)
    expect(getByText('Card Header Content')).toBeInTheDocument()
  })

  it('renders CardTitle component', () => {
    const { container } = render(<CardTitle />)
    expect(container.firstChild).toHaveClass(
      'font-semibold leading-none tracking-tight'
    )
  })
  it('applies custom className to CardTitle component', () => {
    const { container } = render(<CardTitle className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside CardTitle component', () => {
    const { getByText } = render(<CardTitle>Card Title Content</CardTitle>)
    expect(getByText('Card Title Content')).toBeInTheDocument()
  })

  it('renders CardDescription component', () => {
    const { container } = render(<CardDescription />)
    expect(container.firstChild).toHaveClass('text-sm text-muted-foreground')
  })

  it('applies custom className to CardDescription component', () => {
    const { container } = render(<CardDescription className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside CardDescription component', () => {
    const { getByText } = render(
      <CardDescription>Card Description Content</CardDescription>
    )
    expect(getByText('Card Description Content')).toBeInTheDocument()
  })

  it('renders CardContent component', () => {
    const { container } = render(<CardContent />)
    expect(container.firstChild).toHaveClass('p-6 pt-0')
  })

  it('applies custom className to CardContent component', () => {
    const { container } = render(<CardContent className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside CardContent component', () => {
    const { getByText } = render(<CardContent>Card Content</CardContent>)
    expect(getByText('Card Content')).toBeInTheDocument()
  })

  it('renders CardFooter component', () => {
    const { container } = render(<CardFooter />)
    expect(container.firstChild).toHaveClass('flex items-center p-6 pt-0')
  })

  it('applies custom className to CardFooter component', () => {
    const { container } = render(<CardFooter className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders children inside CardFooter component', () => {
    const { getByText } = render(<CardFooter>Card Footer Content</CardFooter>)
    expect(getByText('Card Footer Content')).toBeInTheDocument()
  })
})
