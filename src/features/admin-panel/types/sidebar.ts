import { type LucideIcon } from 'lucide-react'
// maybe unused

export interface SidebarNavItem {
  id: string
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  isExpanded?: boolean
  badge?: string | number
  items?: SidebarNavItem[]
  disabled?: boolean
}
// maybe unused

export interface SidebarSection {
  id: string
  title?: string
  items: SidebarNavItem[]
}
// maybe unused
export interface SidebarConfig {
  sections: SidebarSection[]
  defaultExpandedItems?: string[]
  allowMultipleExpanded?: boolean
}

// Note: SidebarState and context types are now provided by shadcn/ui sidebar components
// Use useSidebar() hook from '@/components/ui/sidebar' for sidebar state management
