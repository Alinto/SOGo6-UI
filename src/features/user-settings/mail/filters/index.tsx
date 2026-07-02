'use client'

import { useProfile } from '@/features/user-profile'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { useTranslations } from 'next-intl'
import React from 'react'
import MailFiltersSettingsForm from './components/filters-form'
import FiltersSettingsSkeleton from './components/filters-skeleton'
import {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} from './store/mail-filters-settings-api'

const MailFiltersSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_FILTERS')
  const { mainAccount } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data, error, isLoading } = useGetMailFiltersSettingsQuery({
    accountId,
  })
  const [updateData] = useUpdateMailFiltersSettingsMutation()

  // Prefetch folders for the folder picker in filter actions.
  useGetFoldersQuery({ accountId })

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<FiltersSettingsSkeleton />}
    >
      <MailFiltersSettingsForm
        data={data}
        accountId={accountId}
        update={updateData}
      />
    </SettingsAsyncPage>
  )
}

export default MailFiltersSettings
