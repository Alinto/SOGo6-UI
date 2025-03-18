'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import GeneralSettingsForm from './components/general-form'

import {
  useGetGeneralSettingsQuery,
  useUpdateGeneralSettingsMutation,
} from './store/general-settings-api'

const GeneralSettings: React.FC = () => {
  const t = useTranslations('General_Settings')
  const { data, error, isFetching } = useGetGeneralSettingsQuery()
  const [updateData] = useUpdateGeneralSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        'LOADING'
      ) : (
        <GeneralSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default GeneralSettings
