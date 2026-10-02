'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useCreateContactAction } from '@/features/address_books/hooks/use-create-contact-action'
import { useCreateEventAction } from '@/features/calendars/hooks/use-create-event-action'
import { useComposeAction } from '@/features/mails/hooks/use-compose-action'
import { selectOpenDraftIds } from '@/features/mails/store'
import { useCreateTaskAction } from '@/features/tasks/hooks/use-create-task-action'
import { useProfile } from '@/features/user-profile'
import { createModuleFromPathname } from '@/hooks/create-module-from-pathname'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

export type ModuleCreateAction = {
  onClick: () => void
  label: string
  icon: LucideIcon
}

function isContactDetailView(pathname: string): boolean {
  return /^\/address_books\/[^/]+\/[^/]+/.test(pathname)
}

export function useModuleCreateAction(): ModuleCreateAction | null {
  const isMobile = useIsMobile()
  const { openMobile } = useSidebar()
  const pathname = usePathname()
  const { moduleAccess, isLoading } = useProfile()

  const composeAction = useComposeAction({ closeMobileSidebar: false })
  const createEventAction = useCreateEventAction({ closeMobileSidebar: false })
  const createTaskAction = useCreateTaskAction({ closeMobileSidebar: false })
  const createContactAction = useCreateContactAction({
    closeMobileSidebar: false,
  })

  const openDraftIds = useAppSelector(selectOpenDraftIds)
  const tasksFormOpen = useAppSelector((state) => state.tasksUi.isFormOpen)
  const addressBooksFormOpen = useAppSelector(
    (state) =>
      state.addressBooksUi.isFormOpen || state.addressBooksUi.isListFormOpen
  )

  const moduleId = createModuleFromPathname(pathname, moduleAccess, isLoading)

  const moduleAction = useMemo((): ModuleCreateAction | null => {
    if (moduleId === 'mail') return composeAction
    if (moduleId === 'calendar') return createEventAction
    if (moduleId === 'task') return createTaskAction
    if (moduleId === 'contact') return createContactAction
    return null
  }, [
    composeAction,
    createContactAction,
    createEventAction,
    createTaskAction,
    moduleId,
  ])

  if (!isMobile || openMobile || !moduleAction) {
    return null
  }

  const firstSection = pathname.split('/')[1]

  if (firstSection === 'u' && openDraftIds.length > 0) {
    return null
  }

  if (firstSection === 'tasks' && tasksFormOpen) {
    return null
  }

  if (firstSection === 'address_books') {
    if (addressBooksFormOpen || isContactDetailView(pathname)) {
      return null
    }
  }

  return moduleAction
}
