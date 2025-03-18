import { useTranslations } from 'next-intl'
import React from 'react'
import MailGeneralSettings from './_form/mail-general-form'

const ForwardPage: React.FC = () => {
  const t = useTranslations('Mail_Settings')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      <MailGeneralSettings />
    </div>
  )
}

export default ForwardPage
