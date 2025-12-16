'use client'

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
  const { data, error, isLoading } = useGetMailForwardSettingsQuery()
  const [updateData] = useUpdateMailForwardSettingsMutation()

  if (error) {
    console.log(error)
    return (
      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-2xl">{t('title.string')}</h2>
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-4 text-sm">
          {t('errors_api.load_failed.string')}
        </div>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isLoading ? (
        <ForwardSettingsSkeleton />
      ) : (
        <MailForwardSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailForwardSettings
