'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ImapEditForm from './components/imap-edit-form'
import ImapListView from './components/imap-list-view'
import ImapNewForm from './components/imap-new-form'

type ViewMode = 'list' | 'edit' | 'new'

const MailImapAccountSettings = () => {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')
  const [mode, setMode] = useState<ViewMode>('list')
  const [selectedAccountId, setSelectedAccountId] = useState<string>()

  const handleEdit = (accountId: string) => {
    setSelectedAccountId(accountId)
    setMode('edit')
  }

  const handleAdd = () => {
    setMode('new')
  }

  const handleBack = () => {
    setMode('list')
    setSelectedAccountId(undefined)
  }

  const handleCreateSuccess = () => {
    setMode('list')
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>

      {mode === 'list' && (
        <ImapListView onEdit={handleEdit} onAdd={handleAdd} />
      )}

      {mode === 'edit' && selectedAccountId && (
        <ImapEditForm accountId={selectedAccountId} onBack={handleBack} />
      )}

      {mode === 'new' && (
        <ImapNewForm onBack={handleBack} onSuccess={handleCreateSuccess} />
      )}
    </div>
  )
}

export default MailImapAccountSettings
