import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupContent: ({
    children,
    className,
    ...props
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-group-content" className={className} {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

jest.mock('@/features/tasks', () => ({
  useGetTasksQuery: () => ({
    data: [
      {
        key: 'task-1',
        id: 'task-1',
        title: 'Demo task',
        status: 'needs_action',
      },
    ],
    isLoading: false,
  }),
}))

import TasksContent from '../tasks-content'

describe('TasksContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders tasks panel with preview', () => {
      render(<TasksContent />)
      expect(screen.getByTestId('tasks-panel')).toBeInTheDocument()
      expect(screen.getByText('Demo task')).toBeInTheDocument()
    })
  })
})
