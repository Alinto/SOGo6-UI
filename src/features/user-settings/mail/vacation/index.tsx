'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import MailVacationSettingsForm from './components/vacation-form'
import {
  useGetMailVacationSettingsQuery,
  useUpdateMailVacationSettingsMutation,
} from './store/mail-vacation-settings-api'

const MailVacationSettings: React.FC = () => {
  const t = useTranslations('Mail_Settings_Vacation')
  const { data, error, isFetching } = useGetMailVacationSettingsQuery()
  const [updateData] = useUpdateMailVacationSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        'LOADING'
      ) : (
        <MailVacationSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailVacationSettings
