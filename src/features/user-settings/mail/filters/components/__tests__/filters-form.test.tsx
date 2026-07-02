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

jest.mock('../filters-form-core', () => ({
  __esModule: true,
  default: ({
    data,
    accountId,
  }: {
    data: MailFilter[] | undefined
    accountId: string
  }) => (
    <div
      data-testid="filters-form-core"
      data-account-id={accountId}
      data-has-data={String(!!data?.length)}
    />
  ),
}))

async function renderForm(props: {
  data?: MailFilter[]
  accountId?: string
  update?: jest.Mock
}) {
  const LazyFiltersForm = (await import('../filters-form')).default
  render(
    <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
      <LazyFiltersForm
        data={props.data}
        accountId={props.accountId ?? '0'}
        update={props.update ?? jest.fn()}
      />
    </Suspense>
  )
  await screen.findByTestId('filters-form-core')
}

describe('LazyFiltersForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exports a lazy form wrapper as default', () => {
    const mod = require('../filters-form')
    expect(mod.default).toBeDefined()
    expect(typeof mod.default).toBe('function')
  })

  it('renders the lazy core after resolving', async () => {
    await renderForm({ data: undefined })
    expect(screen.getByTestId('filters-form-core')).toBeInTheDocument()
  })

  it('passes accountId and data to the core component', async () => {
    const filter = { ...createEmptyFilter(), name: 'Test' }
    await renderForm({ data: [filter], accountId: 'acc-7' })
    const core = screen.getByTestId('filters-form-core')
    expect(core).toHaveAttribute('data-account-id', 'acc-7')
    expect(core).toHaveAttribute('data-has-data', 'true')
  })

  it('passes undefined data correctly', async () => {
    await renderForm({ data: undefined })
    expect(screen.getByTestId('filters-form-core')).toHaveAttribute(
      'data-has-data',
      'false'
    )
  })
})
