import { useTranslations } from 'next-intl'
import React from 'react'
const MailImapAccountSettings: React.FC = () => {
  const t = useTranslations('Mail_Settings_IMAP_Accounts')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
    </div>
  )
}

export default MailImapAccountSettings
