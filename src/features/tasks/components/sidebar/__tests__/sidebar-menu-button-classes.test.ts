import {
  tasksOverdueCountBadgeClassName,
  tasksOverdueCountBadgeLabelClassName,
  tasksSidebarMenuButtonClassName,
  tasksSidebarMenuCountClassName,
  tasksSidebarMenuLabelRowClassName,
} from '../sidebar-menu-button-classes'

describe('sidebar-menu-button-classes', () => {
  describe('custom styling', () => {
    it('exports menu button classes with h-10', () => {
      expect(tasksSidebarMenuButtonClassName).toContain('h-10')
      expect(tasksSidebarMenuButtonClassName).toContain('align-middle')
    })

    it('exports label row flex classes', () => {
      expect(tasksSidebarMenuLabelRowClassName).toContain('flex')
      expect(tasksSidebarMenuLabelRowClassName).toContain('min-w-0')
    })

    it('exports count typography classes', () => {
      expect(tasksSidebarMenuCountClassName).toContain('text-xs')
      expect(tasksSidebarMenuCountClassName).toContain('tabular-nums')
    })

    it('exports overdue count badge classes for a centered circle', () => {
      expect(tasksOverdueCountBadgeClassName).toContain('min-w-5')
      expect(tasksOverdueCountBadgeClassName).toContain('place-items-center')
      expect(tasksOverdueCountBadgeLabelClassName).toContain('leading-none')
      expect(tasksOverdueCountBadgeLabelClassName).toContain('translate-y-px')
    })
  })
})
