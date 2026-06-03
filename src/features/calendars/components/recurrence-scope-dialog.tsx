'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { useTranslations } from 'next-intl'

export type RecurrenceScope = 'ONE' | 'THISANDFUTURE' | 'ALL'

const SCOPES: RecurrenceScope[] = ['ONE', 'THISANDFUTURE', 'ALL']

export function eventNeedsRecurrenceScope(
  event: CalendarEvent | null | undefined
): boolean {
  return !!(event?.recurrence || event?.recurrence_rule || event?.recurrence_id)
}

interface RecurrenceScopeDialogProps {
  open: boolean
  mode: 'edit' | 'delete'
  onSelect: (scope: RecurrenceScope) => void
  onCancel: () => void
}

export function RecurrenceScopeDialog({
  open,
  mode,
  onSelect,
  onCancel,
}: RecurrenceScopeDialogProps) {
  const t = useTranslations('CALENDARS')

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === 'edit'
              ? t('recurrenceScope.editTitle.string')
              : t('recurrenceScope.deleteTitle.string')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('recurrenceScope.description.string')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2 py-2">
          {SCOPES.map((scope) => (
            <Button
              key={scope}
              type="button"
              variant="outline"
              className="justify-start"
              onClick={() => onSelect(scope)}
            >
              {t(`recurrenceScope.${scope}.string`)}
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={onCancel}>
            {t('recurrenceScope.cancel.string')}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
