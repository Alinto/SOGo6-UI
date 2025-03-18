import { useTranslations } from 'next-intl'
import React from 'react'
import FiltersForm from './_form/filters-form'

const FiltersPage: React.FC = () => {
  const t = useTranslations('Mail_Settings_Filters')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      <FiltersForm />
    </div>
  )
}

export default FiltersPage
