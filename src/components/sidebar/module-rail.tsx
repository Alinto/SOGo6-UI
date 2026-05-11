'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import {
  Calendar1Icon,
  ClipboardList,
  Contact2,
  NotebookText,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

type ModuleId = 'address-book' | 'calendar' | 'tasks' | 'notes'

interface ModuleRailProps {
  onModuleSelect: (id: ModuleId) => void
}

const ModuleRail: React.FC<ModuleRailProps> = ({ onModuleSelect }) => {
  const t = useTranslations('NAVIGATION')

  const items: {
    id: ModuleId
    title: string
    icon: React.ComponentType
  }[] = [
    {
      id: 'address-book',
      title: t('address_book.string'),
      icon: Contact2,
    },
    {
      id: 'calendar',
      title: t('calendar.string'),
      icon: Calendar1Icon,
    },
    {
      id: 'tasks',
      title: t('tasks.string'),
      icon: ClipboardList,
    },
    {
      id: 'notes',
      title: t('notes.string'),
      icon: NotebookText,
    },
  ]

  return (
    <Sidebar
      className={cn(
        'text-accent bg-sidebar-background-secondary mt-12 hidden border-0 md:block'
      )}
      side="right"
    >
      <SidebarContent className="overflow-hidden">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id} className="mt-4 align-middle">
                  <SidebarMenuButton onClick={() => onModuleSelect(item.id)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export type { ModuleId }
export default memo(ModuleRail)
