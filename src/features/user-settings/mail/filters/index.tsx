'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import MailFiltersSettingsForm from './components/filters-form'

import {
  useGetMailFiltersSettingsQuery,
  useUpdateMailFiltersSettingsMutation,
} from './store/mail-filters-settings-api'

const MailFiltersSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_FILTERS')
  const { data, error, isFetching } = useGetMailFiltersSettingsQuery()
  const [updateData] = useUpdateMailFiltersSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        'LOADING'
      ) : (
        <MailFiltersSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailFiltersSettings
