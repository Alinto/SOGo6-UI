import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import FastAccessContent from '../index'
import type { FastAccessModuleId } from '@/features/mails/components/sidebars/fast-access/context'

jest.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({
    children,
    side,
    className,
  }: {
    children: ReactNode
    side?: string
    className?: string
  }) => (
    <aside data-testid="sidebar" data-side={side} className={className}>
      {children}
    </aside>
  ),
  SidebarContent: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-content" className={className}>
      {children}
    </div>
  ),
}))

jest.mock('../address-book-content', () => ({
  __esModule: true,
  default: () => <div data-testid="address-book-panel" />,
}))

jest.mock('../calendar-content', () => ({
  __esModule: true,
  default: () => <div data-testid="calendar-panel" />,
}))

jest.mock('../notes-content', () => ({
  __esModule: true,
  default: () => <div data-testid="notes-panel" />,
}))

jest.mock('../tasks-content', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-panel" />,
}))

const cases: { name: FastAccessModuleId; panel: string }[] = [
  { name: 'address-book', panel: 'address-book-panel' },
  { name: 'calendar', panel: 'calendar-panel' },
  { name: 'tasks', panel: 'tasks-panel' },
  { name: 'notes', panel: 'notes-panel' },
]

describe('FastAccessContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it.each(cases)('renders $name panel inside sidebar', ({ name, panel }) => {
      render(<FastAccessContent name={name} />)
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId(panel)).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('uses a right sidebar', () => {
      render(<FastAccessContent name="calendar" />)
      expect(screen.getByTestId('sidebar')).toHaveAttribute('data-side', 'right')
    })

    it('applies rail-oriented classes on sidebar', () => {
      render(<FastAccessContent name="calendar" />)
      const sidebar = screen.getByTestId('sidebar')
      expect(sidebar).toHaveClass('mt-12', 'mr-10', 'border-0')
    })

    it('applies scroll classes on sidebar content', () => {
      render(<FastAccessContent name="calendar" />)
      const content = screen.getByTestId('sidebar-content')
      expect(content).toHaveClass('overflow-x-hidden', 'overflow-y-auto')
    })
  })

  describe('integration', () => {
    it('nests panel inside sidebar content', () => {
      render(<FastAccessContent name="tasks" />)
      const sidebar = screen.getByTestId('sidebar')
      const inner = screen.getByTestId('sidebar-content')
      expect(sidebar).toContainElement(inner)
      expect(inner).toContainElement(screen.getByTestId('tasks-panel'))
    })
  })

  describe('component stability', () => {
    it('switches panel when name prop changes', () => {
      const { rerender } = render(<FastAccessContent name="calendar" />)
      expect(screen.getByTestId('calendar-panel')).toBeInTheDocument()

      rerender(<FastAccessContent name="notes" />)
      expect(screen.queryByTestId('calendar-panel')).not.toBeInTheDocument()
      expect(screen.getByTestId('notes-panel')).toBeInTheDocument()
    })
  })
})
