'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import MailNotificationsSettingForm from './components/notifications-form'
import {
  useGetMailNotificationsSettingsQuery,
  useUpdateMailNotificationsSettingsMutation,
} from './store/mail-notifications-settings-api'
import { PageLoader } from '@/components/lazy-components'

const MailNotificationsSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_NOTIFICATIONS')
  const { data, error, isFetching } = useGetMailNotificationsSettingsQuery()
  const [updateData] = useUpdateMailNotificationsSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        <PageLoader />
      ) : (
        <MailNotificationsSettingForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailNotificationsSettings
