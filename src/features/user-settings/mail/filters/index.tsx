'use client'

import { useProfile } from '@/features/user-profile'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import {
  SettingsPageHeader,
  SettingsPageShell,
} from '@/features/user-settings/components/settings-page-layout'
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

  useGetFoldersQuery({ accountId })

  const header = (
    <SettingsPageHeader
      title={t('title.string')}
      description={t('page.description.string')}
    />
  )

  if (error) {
    const status = 'status' in error ? error.status : undefined
    const messageKey =
      status === 403
        ? 'errors_api.feature_disabled.string'
        : 'errors_api.load_failed.string'

    return (
      <SettingsPageShell>
        {header}
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {t(messageKey)}
        </div>
      </SettingsPageShell>
    )
  }

  return (
    <SettingsPageShell>
      {header}
      {isLoading ? (
        <FiltersSettingsSkeleton />
      ) : (
        <MailFiltersSettingsForm
          data={data}
          accountId={accountId}
          update={updateData}
        />
      )}
    </SettingsPageShell>
  )
}

export default MailFiltersSettings
