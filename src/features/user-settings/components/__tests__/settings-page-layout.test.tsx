import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import {
  SettingsPageHeader,
  SettingsPageShell,
} from '../settings-page-layout'

describe('SettingsPageShell', () => {
  it('renders children inside the shell', () => {
    render(
      <SettingsPageShell>
        <p>Settings content</p>
      </SettingsPageShell>
    )
    expect(screen.getByText('Settings content')).toBeInTheDocument()
  })

  it('applies optional className', () => {
    render(
      <SettingsPageShell className="custom-shell">
        <span>Child</span>
      </SettingsPageShell>
    )
    expect(screen.getByText('Child').parentElement).toHaveClass('custom-shell')
  })
})

describe('SettingsPageHeader', () => {
  it('renders title and description', () => {
    render(
      <SettingsPageHeader
        title="Mail filters"
        description="Manage your filters"
      />
    )
    expect(
      screen.getByRole('heading', { name: 'Mail filters' })
    ).toBeInTheDocument()
    expect(screen.getByText('Manage your filters')).toBeInTheDocument()
  })

  it('renders optional actions slot', () => {
    render(
      <SettingsPageHeader
        title="Mail filters"
        actions={<button type="button">Add</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('omits description when not provided', () => {
    render(<SettingsPageHeader title="Mail filters" />)
    expect(screen.queryByText('Manage your filters')).not.toBeInTheDocument()
  })
})
