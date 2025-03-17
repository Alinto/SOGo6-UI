import { useTranslations } from 'next-intl'
import React from 'react'
import NotificationsForm from './_form/notifications-form'

const NotificationsPage: React.FC = () => {
  const t = useTranslations('Mail_Settings_Notifications')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title')}</h2>
      <NotificationsForm />
    </div>
  )
}

export default NotificationsPage
