import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  FastAccessProvider,
  useFastAccess,
  useFastAccessRequired,
} from '../context'

function RequiredConsumer() {
  const ctx = useFastAccessRequired()
  return (
    <div>
      <span data-testid="is-open">{String(ctx.isOpen)}</span>
      <span data-testid="active">{ctx.activeModule ?? 'none'}</span>
      <button type="button" onClick={() => ctx.openModule('calendar')}>
        open-calendar
      </button>
      <button type="button" onClick={() => ctx.closeModule()}>
        close
      </button>
      <button type="button" onClick={() => ctx.toggleModule('tasks')}>
        toggle-tasks
      </button>
      <button type="button" onClick={() => ctx.toggleModule('calendar')}>
        toggle-calendar
      </button>
    </div>
  )
}

function OptionalConsumer() {
  const ctx = useFastAccess()
  return (
    <span data-testid="optional">{ctx === null ? 'null' : 'present'}</span>
  )
}

describe('FastAccessProvider / context', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('provides default closed state with no active module', () => {
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      expect(screen.getByTestId('is-open')).toHaveTextContent('false')
      expect(screen.getByTestId('active')).toHaveTextContent('none')
    })
  })

  describe('configuration', () => {
    it('openModule sets module and opens', async () => {
      const user = userEvent.setup()
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'open-calendar' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('true')
      expect(screen.getByTestId('active')).toHaveTextContent('calendar')
    })

    it('closeModule sets isOpen false without clearing activeModule', async () => {
      const user = userEvent.setup()
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'open-calendar' }))
      await user.click(screen.getByRole('button', { name: 'close' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('false')
      expect(screen.getByTestId('active')).toHaveTextContent('calendar')
    })
  })

  describe('integration', () => {
    it('toggleModule opens when closed', async () => {
      const user = userEvent.setup()
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'toggle-tasks' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('true')
      expect(screen.getByTestId('active')).toHaveTextContent('tasks')
    })

    it('toggleModule closes when same module is open', async () => {
      const user = userEvent.setup()
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'toggle-calendar' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('true')
      await user.click(screen.getByRole('button', { name: 'toggle-calendar' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('false')
    })

    it('toggleModule switches module when another is active', async () => {
      const user = userEvent.setup()
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'toggle-tasks' }))
      await user.click(screen.getByRole('button', { name: 'toggle-calendar' }))
      expect(screen.getByTestId('is-open')).toHaveTextContent('true')
      expect(screen.getByTestId('active')).toHaveTextContent('calendar')
    })
  })

  describe('accessibility', () => {
    it('exposes type="button" controls', () => {
      render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      screen.getAllByRole('button').forEach((btn) => {
        expect(btn).toHaveAttribute('type', 'button')
      })
    })
  })

  describe('component stability', () => {
    it('useFastAccess returns null outside provider', () => {
      render(<OptionalConsumer />)
      expect(screen.getByTestId('optional')).toHaveTextContent('null')
    })

    it('useFastAccess returns context inside provider', () => {
      render(
        <FastAccessProvider>
          <OptionalConsumer />
        </FastAccessProvider>
      )
      expect(screen.getByTestId('optional')).toHaveTextContent('present')
    })

    it('keeps state consistent after rerender', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )

      await user.click(screen.getByRole('button', { name: 'open-calendar' }))
      rerender(
        <FastAccessProvider>
          <RequiredConsumer />
        </FastAccessProvider>
      )
      expect(screen.getByTestId('is-open')).toHaveTextContent('true')
    })
  })
})

describe('useFastAccessRequired', () => {
  it('throws when used outside FastAccessProvider', () => {
    expect(() => render(<RequiredConsumer />)).toThrow(
      'useFastAccessRequired must be used within FastAccessProvider'
    )
  })
})
