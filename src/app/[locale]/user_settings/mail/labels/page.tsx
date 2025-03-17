import { useTranslations } from 'next-intl'
import React from 'react'
import LabelsForm from './_form/labels-form'

const ForwardPage: React.FC = () => {
  const t = useTranslations('Mail_Settings_Labels')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title')}</h2>
      <LabelsForm />
    </div>
  )
}

export default ForwardPage
