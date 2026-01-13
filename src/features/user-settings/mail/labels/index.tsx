'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import MailLabelsSettingsForm from './components/labels-form'
import { PageLoader } from '@/components/lazy-components'
import {
  useGetMailLabelsSettingsQuery,
  useUpdateMailLabelsSettingsMutation,
} from './store/mail-labels-settings-api'

const MailLabelsSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_LABELS')
  const { data, error, isFetching } = useGetMailLabelsSettingsQuery()
  const [updateData] = useUpdateMailLabelsSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        <PageLoader />
      ) : (
        <MailLabelsSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default MailLabelsSettings
