import { useTranslations } from 'next-intl'
import React from 'react'
const IMAPAccountPage: React.FC = () => {
  const t = useTranslations('Mail_Settings_IMAP_Accounts')
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title')}</h2>
      {/* <LabelsForm /> */}
    </div>
  )
}

export default IMAPAccountPage
