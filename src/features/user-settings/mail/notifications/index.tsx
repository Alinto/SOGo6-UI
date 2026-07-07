'use client'

import { useProfile } from '@/features/user-profile'
import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { useTranslations } from 'next-intl'
import React from 'react'
import MailNotificationsSettingForm from './components/notifications-form'
import NotificationsSettingsSkeleton from './components/notifications-skeleton'
import {
  useGetMailNotificationSettingsQuery,
  useUpdateMailNotificationSettingsMutation,
} from './store/mail-notifications-settings-api'

const MailNotificationsSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_NOTIFICATIONS')
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data, error, isLoading } = useGetMailNotificationSettingsQuery({
    accountId,
  })
  const [updateData] = useUpdateMailNotificationSettingsMutation()

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<NotificationsSettingsSkeleton />}
    >
      <MailNotificationsSettingForm
        data={data}
        accountId={accountId}
        update={updateData}
      />
    </SettingsAsyncPage>
  )
}

export default MailNotificationsSettings
