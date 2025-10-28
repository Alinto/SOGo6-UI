import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import React from 'react'

interface DeleteActionProps {
  id: string
  name?: string
}

const DeleteAction: React.FC<DeleteActionProps> = ({ id }) => {
  const t = useTranslations('CALENDARS')

  const handleDelete = () => {
    // TODO: Implement delete mutation
    console.log('Delete calendar:', id)
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
        <Button variant="outline" onClick={() => {}}>
          {t('forms.deleteCalendar.cancel.string')}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          {t('forms.deleteCalendar.confirm.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default DeleteAction
