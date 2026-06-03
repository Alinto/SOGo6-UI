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
import {
  useFastAccess,
  type FastAccessModuleId,
} from '@/features/mails/components/sidebars/fast-access/context'
import { ModuleNavIcon } from '@/lib/icons/module-nav-icons'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React, { memo, useCallback } from 'react'

const FALLBACK_ROUTES: Record<FastAccessModuleId, string> = {
  'address-book': '/address_books',
  calendar: '/calendars',
  tasks: '/tasks',
  notes: '/notes',
}

const ModuleRail: React.FC = () => {
  const t = useTranslations('NAVIGATION')
  const router = useRouter()
  const fastAccess = useFastAccess()

  const handleSelect = useCallback(
    (id: FastAccessModuleId) => {
      if (fastAccess) {
        fastAccess.toggleModule(id)
      } else {
        router.push(FALLBACK_ROUTES[id])
      }
    },
    [fastAccess, router]
  )

  const items: {
    id: FastAccessModuleId
    title: string
    icon: React.ComponentType
  }[] = [
    {
      id: 'address-book',
      title: t('address_book.string'),
      icon: ModuleNavIcon.AddressBook,
    },
    {
      id: 'calendar',
      title: t('calendar.string'),
      icon: ModuleNavIcon.Calendar,
    },
    {
      id: 'tasks',
      title: t('tasks.string'),
      icon: ModuleNavIcon.Tasks,
    },
    {
      id: 'notes',
      title: t('notes.string'),
      icon: ModuleNavIcon.Notes,
    },
  ]

  return (
    <Sidebar
      className={cn(
        'text-sidebar-foreground-secondary bg-sidebar-background-secondary mt-12 hidden border-0 md:block'
      )}
      side="right"
    >
      <SidebarContent className="overflow-hidden">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.id} className="mt-4 align-middle">
                  <SidebarMenuButton
                    className={cn(
                      'text-sidebar-foreground-secondary hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-5'
                    )}
                    onClick={() => handleSelect(item.id)}
                    data-active={
                      fastAccess?.isOpen &&
                      fastAccess.activeModule === item.id
                    }
                  >
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

export type { FastAccessModuleId as ModuleId }
export default memo(ModuleRail)
