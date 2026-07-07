import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { createEmptyNotification } from '../../mail-notifications-utils'

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

jest.mock('../notifications-form-core', () => ({
  __esModule: true,
  default: ({
    data,
    accountId,
  }: {
    data: unknown
    accountId: string
  }) => (
    <div
      data-testid="notifications-form-core"
      data-account-id={accountId}
      data-has-data={String(!!data)}
    />
  ),
}))

async function renderForm(props: {
  data?: ReturnType<typeof createEmptyNotification> | undefined
  accountId?: string
  update?: jest.Mock
}) {
  const LazyNotificationsForm = (await import('../notifications-form')).default
  render(
    <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
      <LazyNotificationsForm
        data={props.data}
        accountId={props.accountId ?? '0'}
        update={props.update ?? jest.fn()}
      />
    </Suspense>
  )
  await screen.findByTestId('notifications-form-core')
}

describe('LazyNotificationsForm', () => {
  const mockUpdate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exports a lazy form wrapper as default', () => {
    const mod = require('../notifications-form')
    expect(mod.default).toBeDefined()
  })

  it('renders form core after lazy load', async () => {
    await renderForm({
      data: createEmptyNotification(),
      accountId: 'acc-1',
      update: mockUpdate,
    })

    expect(screen.getByTestId('notifications-form-core')).toBeInTheDocument()
  })

  it('passes accountId and data to core', async () => {
    await renderForm({
      data: createEmptyNotification(),
      accountId: 'acc-1',
      update: mockUpdate,
    })

    const core = screen.getByTestId('notifications-form-core')
    expect(core).toHaveAttribute('data-account-id', 'acc-1')
    expect(core).toHaveAttribute('data-has-data', 'true')
  })

  it('passes undefined data', async () => {
    await renderForm({
      data: undefined,
      accountId: '0',
      update: mockUpdate,
    })

    expect(screen.getByTestId('notifications-form-core')).toHaveAttribute(
      'data-has-data',
      'false'
    )
  })
})
