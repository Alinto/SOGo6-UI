'use client'

import { useCreateContactAction } from '@/features/address_books/hooks/use-create-contact-action'
import { useGetCalendarsQuery } from '@/features/calendars'
import { useCreateEventAction } from '@/features/calendars/hooks/use-create-event-action'
import { isPersonalCalendar } from '@/features/calendars/utils/calendar-source-type'
import { isCalendarWritable } from '@/features/calendars/utils/is-calendar-writable'
import { pickPreferredCalendar } from '@/features/calendars/utils/pick-preferred-calendar'
import { useComposeAction } from '@/features/mails/hooks/use-compose-action'
import { useCreateTaskAction } from '@/features/tasks/hooks/use-create-task-action'
import { useProfile } from '@/features/user-profile'
import {
  hasModuleAccess,
  type CreateModuleId,
} from '@/hooks/create-module-from-pathname'
import type { LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

export type { CreateModuleId }

export type CrossModuleCreateAction = {
  id: CreateModuleId
  onClick: () => void
  label: string
  icon: LucideIcon
  disabled?: boolean
}

const MODULE_ORDER: CreateModuleId[] = ['mail', 'calendar', 'contact', 'task']

export function useCrossModuleCreateActions(primaryId: CreateModuleId | null): {
  primary: CrossModuleCreateAction | null
  others: CrossModuleCreateAction[]
} {
  const { moduleAccess, isLoading } = useProfile()
  const composeAction = useComposeAction()
  const createEventAction = useCreateEventAction()
  const createTaskAction = useCreateTaskAction()
  const createContactAction = useCreateContactAction()
  const { data: calendars } = useGetCalendarsQuery()

  const eventDisabled = useMemo(() => {
    if (!calendars) return false
    return !isCalendarWritable(pickPreferredCalendar(calendars))
  }, [calendars])

  const taskDisabled = useMemo(() => {
    if (!calendars) return false
    return !calendars.some(isPersonalCalendar)
  }, [calendars])

  return useMemo(() => {
    const byId: Record<CreateModuleId, CrossModuleCreateAction> = {
      mail: {
        id: 'mail',
        onClick: composeAction.onClick,
        label: composeAction.label,
        icon: composeAction.icon,
      },
      calendar: {
        id: 'calendar',
        onClick: createEventAction.onClick,
        label: createEventAction.label,
        icon: createEventAction.icon,
        disabled: eventDisabled,
      },
      contact: {
        id: 'contact',
        onClick: createContactAction.onClick,
        label: createContactAction.label,
        icon: createContactAction.icon,
        disabled: createContactAction.disabled,
      },
      task: {
        id: 'task',
        onClick: createTaskAction.onClick,
        label: createTaskAction.label,
        icon: createTaskAction.icon,
        disabled: taskDisabled,
      },
    }

    const accessible = MODULE_ORDER.filter((id) => {
      if (id === 'mail') return hasModuleAccess(moduleAccess, 'mail', isLoading)
      if (id === 'calendar') {
        return hasModuleAccess(moduleAccess, 'calendar', isLoading)
      }
      if (id === 'contact') {
        return hasModuleAccess(moduleAccess, 'contact', isLoading)
      }
      return true
    })

    return {
      primary: primaryId ? byId[primaryId] : null,
      others: accessible.filter((id) => id !== primaryId).map((id) => byId[id]),
    }
  }, [
    composeAction.icon,
    composeAction.label,
    composeAction.onClick,
    createContactAction.disabled,
    createContactAction.icon,
    createContactAction.label,
    createContactAction.onClick,
    createEventAction.icon,
    createEventAction.label,
    createEventAction.onClick,
    createTaskAction.icon,
    createTaskAction.label,
    createTaskAction.onClick,
    eventDisabled,
    isLoading,
    moduleAccess,
    primaryId,
    taskDisabled,
  ])
}
