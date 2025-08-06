'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import MailGeneralSettingsForm from './components/mail-general-form'
import {
  useGetMailGeneralSettingsQuery,
  useUpdateMailGeneralSettingsMutation,
} from './store/mail-general-settings-api'

const MailGeneralSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_GENERAL')
  const { data, error, isFetching } = useGetMailGeneralSettingsQuery()
  const [updateData] = useUpdateMailGeneralSettingsMutation()
  if (error) {
    console.log(error)
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        'LOADING'
      ) : (
        <MailGeneralSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailGeneralSettings
