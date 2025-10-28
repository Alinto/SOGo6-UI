import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import React from 'react'

interface LinkActionProps {
  id: string
}

const LinkAction: React.FC<LinkActionProps> = ({ id }) => {
  const t = useTranslations('CALENDARS')
  const calendarUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/calendars/${id}/subscribe`

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('sidebar.link.string')}</DialogTitle>
        <DialogDescription>
          {t('sidebar.link.description.string')}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <Input value={calendarUrl} readOnly />
      </div>
    </>
  )
}

export default LinkAction
