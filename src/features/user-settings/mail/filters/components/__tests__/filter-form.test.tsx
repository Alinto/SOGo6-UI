import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import type { MailFilter } from '../../mail-filters-types'
import { createEmptyFilter } from '../../mail-filters-utils'

jest.mock('@/components/lazy-components', () => ({
  FormLoader: () => <div data-testid="form-loader">Loading...</div>,
  LazyWrapper: ({
    children,
    fallback,
  }: {
    children: React.ReactNode
    fallback: React.ReactNode
  }) => <Suspense fallback={fallback}>{children}</Suspense>,
}))

jest.mock('../filter-form-core', () => ({
  __esModule: true,
  default: ({
    open,
    accountId,
  }: {
    open: boolean
    accountId: string
  }) =>
    open ? (
      <div data-testid="filter-form-core" data-account-id={accountId} />
    ) : null,
}))

async function renderDialog(
  props: Partial<React.ComponentProps<typeof import('../filter-form').default>> = {}
) {
  const FilterEditDialog = (await import('../filter-form')).default
  render(
    <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
      <FilterEditDialog
        open
        accountId="acc-1"
        onOpenChange={jest.fn()}
        onSave={jest.fn()}
        filter={createEmptyFilter()}
        {...props}
      />
    </Suspense>
  )
  await screen.findByTestId('filter-form-core')
}

describe('FilterEditDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exports a lazy dialog wrapper as default', () => {
    const mod = require('../filter-form')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('renders the lazy core after resolving', async () => {
    await renderDialog()
    expect(screen.getByTestId('filter-form-core')).toBeInTheDocument()
  })

  it('passes accountId to the core component', async () => {
    await renderDialog({ accountId: 'acc-42' })
    expect(screen.getByTestId('filter-form-core')).toHaveAttribute(
      'data-account-id',
      'acc-42'
    )
  })

  it('does not render core when closed', async () => {
    const FilterEditDialog = (await import('../filter-form')).default
    render(
      <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
        <FilterEditDialog
          open={false}
          accountId="acc-1"
          onOpenChange={jest.fn()}
          onSave={jest.fn()}
        />
      </Suspense>
    )
    expect(screen.queryByTestId('filter-form-core')).not.toBeInTheDocument()
  })
})
