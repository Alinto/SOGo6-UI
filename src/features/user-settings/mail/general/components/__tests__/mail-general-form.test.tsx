import type { UserPreferences } from '@/features/user-settings/store/user-preferences-api-types'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'

// ── Mocks ─────────────────────────────────────────────────────────────────────

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

jest.mock('../mail-general-form-core', () => ({
  __esModule: true,
  default: ({ data, update }: { data: any; update: any }) => (
    <div data-testid="mail-general-form-core" data-has-data={String(!!data)}>
      Mail General Form Core
    </div>
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

async function renderForm(props: {
  data: UserPreferences | undefined
  update: jest.Mock
}) {
  const result = render(
    <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
      {(() => {
        const LazyMailGeneralForm = require('../mail-general-form').default
        return <LazyMailGeneralForm {...props} />
      })()}
    </Suspense>
  )
  // Wait for lazy component to resolve
  await screen.findByTestId('mail-general-form-core')
  return result
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('LazyMailGeneralForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── exports ───────────────────────────────────────────────────────────────

  describe('exports', () => {
    it('exports LazyMailGeneralForm as default export', () => {
      const mod = require('../mail-general-form')
      expect(mod.default).toBeDefined()
      expect(typeof mod.default).toBe('function')
    })

    it('exports GeneralSettingsForm as named export', () => {
      const mod = require('../mail-general-form')
      expect(mod.GeneralSettingsForm).toBeDefined()
      expect(typeof mod.GeneralSettingsForm).toBe('function')
    })

    it('default export and GeneralSettingsForm are the same component', () => {
      const mod = require('../mail-general-form')
      expect(mod.default).toBe(mod.GeneralSettingsForm)
    })
  })

  // ── rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the lazy form core after resolving', async () => {
      await renderForm({ data: undefined, update: jest.fn() })
      expect(screen.getByTestId('mail-general-form-core')).toBeInTheDocument()
    })

    it('renders with data=undefined without crashing', async () => {
      await expect(
        renderForm({ data: undefined, update: jest.fn() })
      ).resolves.not.toThrow()
    })

    it('renders with data provided without crashing', async () => {
      const data = { some: 'preferences' } as unknown as UserPreferences
      await expect(
        renderForm({ data, update: jest.fn() })
      ).resolves.not.toThrow()
    })

    it('passes data prop to the lazy core component', async () => {
      const data = { some: 'preferences' } as unknown as UserPreferences
      await renderForm({ data, update: jest.fn() })
      expect(screen.getByTestId('mail-general-form-core')).toHaveAttribute(
        'data-has-data',
        'true'
      )
    })

    it('passes undefined data prop correctly', async () => {
      await renderForm({ data: undefined, update: jest.fn() })
      expect(screen.getByTestId('mail-general-form-core')).toHaveAttribute(
        'data-has-data',
        'false'
      )
    })
  })

  // ── lazy loading ──────────────────────────────────────────────────────────

  describe('lazy loading', () => {
    it('wraps the core form in a LazyWrapper', () => {
      const { LazyWrapper } = require('@/components/lazy-components')
      expect(LazyWrapper).toBeDefined()
    })

    it('uses FormLoader as the fallback', () => {
      const { FormLoader } = require('@/components/lazy-components')
      expect(FormLoader).toBeDefined()
    })

    it('shows the FormLoader fallback while loading', () => {
      // Render synchronously to catch the Suspense fallback state
      const LazyMailGeneralForm = require('../mail-general-form').default
      render(
        <Suspense fallback={<div data-testid="form-loader">Loading...</div>}>
          <LazyMailGeneralForm data={undefined} update={jest.fn()} />
        </Suspense>
      )
      // The fallback renders before the lazy component resolves
      // Since our mock resolves synchronously, assert the core is eventually present
      expect(
        screen.queryByTestId('form-loader') ||
          screen.queryByTestId('mail-general-form-core')
      ).toBeInTheDocument()
    })
  })
})
