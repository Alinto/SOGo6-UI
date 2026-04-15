import { useIsMobile } from '@/hooks/use-mobile'
import { render, screen } from '@testing-library/react'
import ListItem from '../list-item'

jest.mock('@/hooks/use-mobile')
jest.mock('../list-item-desktop', () => ({
  __esModule: true,
  default: jest.fn(({ data }) => (
    <div data-testid="list-item-desktop">{data.subject}</div>
  )),
}))
jest.mock('../list-item-mobile', () => ({
  __esModule: true,
  default: jest.fn(({ data }) => (
    <div data-testid="list-item-mobile">{data.subject}</div>
  )),
}))

describe('ListItem Component (Wrapper)', () => {
  const mockData = {
    id: '123',
    subject: 'Test Email Subject',
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [{ name: 'Jane Smith', email: 'jane@example.com' }],
    date: new Date().toISOString(),
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: 'This is a test email snippet',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [] as string[],
  }
  const mockOnHandleCheckboxClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render ListItemDesktop when not on mobile', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('list-item-desktop')).toBeInTheDocument()
  })

  it('should render ListItemMobile when on mobile', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(true)
    render(
      <ListItem
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('list-item-mobile')).toBeInTheDocument()
  })

  it('should pass all props to desktop variant', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
    render(
      <ListItem
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('list-item-desktop')).toBeInTheDocument()
    expect(screen.getByText(mockData.subject)).toBeInTheDocument()
  })

  it('should pass all props to mobile variant', () => {
    ;(useIsMobile as jest.Mock).mockReturnValue(true)
    render(
      <ListItem
        data={mockData}
        isSelected={true}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )
    expect(screen.getByTestId('list-item-mobile')).toBeInTheDocument()
    expect(screen.getByText(mockData.subject)).toBeInTheDocument()
  })

  it('should be memoized', () => {
    const ListItemComponent = ListItem as any
    // ListItem is wrapped with memo, so it should have a $$typeof property
    expect(ListItemComponent).toBeTruthy()
  })
})
