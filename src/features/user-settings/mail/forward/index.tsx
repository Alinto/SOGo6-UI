'use client'

import { useProfile } from '@/features/user-profile'
import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { useTranslations } from 'next-intl'
import React from 'react'
import MailForwardSettingsForm from './components/forward-form'
import ForwardSettingsSkeleton from './components/forward-skeleton'
import {
  useGetMailForwardSettingsQuery,
  useUpdateMailForwardSettingsMutation,
} from './store/mail-forward-settings-api'

const MailForwardSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_FORWARD')
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data, error, isLoading } = useGetMailForwardSettingsQuery({
    accountId,
  })
  const [updateData] = useUpdateMailForwardSettingsMutation()

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<ForwardSettingsSkeleton />}
    >
      <MailForwardSettingsForm
        data={data}
        accountId={accountId}
        update={updateData}
      />
    </SettingsAsyncPage>
  )
}

export default MailForwardSettings
