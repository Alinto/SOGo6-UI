import {
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
  })
})
