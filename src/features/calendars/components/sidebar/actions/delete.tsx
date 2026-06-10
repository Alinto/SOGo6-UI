import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useDeleteCalendarMutation,
  useDeleteExternalCalendarMutation,
} from '@/features/calendars/store/calendars-api'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

interface DeleteActionProps {
  id: string
  name?: string
  sourceType?: string
  onClose?: () => void
}

const DeleteAction: React.FC<DeleteActionProps> = ({ id, sourceType, onClose }) => {
  const t = useTranslations('CALENDARS')
  const [deleteCalendar, { isLoading: isDeletingLocal }] =
    useDeleteCalendarMutation()
  const [deleteExternalCalendar, { isLoading: isDeletingExternal }] =
    useDeleteExternalCalendarMutation()
  const isLoading = isDeletingLocal || isDeletingExternal

  const handleDelete = async () => {
    try {
      if (sourceType === 'ics') {
        await deleteExternalCalendar(id).unwrap()
      } else {
        await deleteCalendar(id).unwrap()
      }
      onClose?.()
    } catch {
      // Notifications are handled by RTK Query onQueryStarted.
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('forms.deleteCalendar.title.string')}</DialogTitle>
        <DialogDescription>
          {t('forms.deleteCalendar.message.string')}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {t('forms.deleteCalendar.cancel.string')}
        </Button>
        <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
          {t('forms.deleteCalendar.confirm.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(DeleteAction)
