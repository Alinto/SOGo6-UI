import { useTranslations } from 'next-intl'
import React from 'react'
import VacationForm from './_form/vacation-form'

const VacationPage: React.FC = () => {
  const t = useTranslations('Mail_Settings_Vacation')

  return (
    <div>
      <h2 className="text-2xl">{t('title.string')}</h2>
      <VacationForm />
    </div>
  )
}

export default VacationPage
