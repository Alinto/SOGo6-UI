import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteCalendarMutation } from '@/features/calendars'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'

interface DeleteActionProps {
  id: string
  name?: string
  onClose?: () => void
}

const DeleteAction: React.FC<DeleteActionProps> = ({ id, onClose }) => {
  const t = useTranslations('CALENDARS')
  const [deleteCalendar, { isLoading }] = useDeleteCalendarMutation()

  const handleDelete = async () => {
    try {
      await deleteCalendar(id).unwrap()
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
