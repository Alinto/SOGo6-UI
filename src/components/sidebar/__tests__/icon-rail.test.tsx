import { render, screen } from '@testing-library/react'
import IconRail from '../icon-rail'

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarSeparator: () => <hr data-testid="separator" />,
}))

jest.mock('../rail-more-button', () => ({
  __esModule: true,
  default: ({ label, count }: { label: string; count: number }) => (
    <li>
      <button type="button" aria-label={label}>
        +{count}
      </button>
    </li>
  ),
}))

let mockRailHeight: number | null = null

jest.mock('@/hooks/use-element-height', () => ({
  useElementHeight: () => ({ ref: jest.fn(), height: mockRailHeight }),
}))

const item = (name: string) => <li key={name}>{name}</li>

const renderRail = (sections: React.ReactElement[][]) =>
  render(
    <IconRail sections={sections} moreLabel={(count) => `${count} more`} />
  )

describe('IconRail', () => {
  beforeEach(() => {
    mockRailHeight = null
  })

  it('shows every entry, sections split by a line, while unmeasured', () => {
    renderRail([[item('A'), item('B')], [item('C')]])

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    expect(screen.getAllByTestId('separator')).toHaveLength(1)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('keeps the list made of items only, the line being hidden', () => {
    renderRail([[item('A')], [item('B')]])

    const line = screen.getByTestId('separator').parentElement
    expect(line?.tagName).toBe('LI')
    expect(line).toHaveAttribute('aria-hidden', 'true')
  })

  it('puts what does not fit behind a "+N" entry', () => {
    // Room for 2 rows: one entry and the "+N" one.
    mockRailHeight = 84

    renderRail([[item('A'), item('B')], [item('C')]])

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('B')).not.toBeInTheDocument()
    expect(screen.queryByTestId('separator')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2 more' })).toHaveTextContent(
      '+2'
    )
  })
})
