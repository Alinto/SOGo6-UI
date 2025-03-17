import { useTranslations } from 'next-intl'
import React from 'react'
import GeneralForm from './_form/general-form'

const ProfilPage: React.FC = () => {
  const t = useTranslations('General_Settings')
  return (
    <>
      <h2 className="text-2xl">{t('title')}</h2>
      <GeneralForm />
    </>
  )
}

export default ProfilPage
