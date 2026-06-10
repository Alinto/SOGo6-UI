'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ExternalAccountForm from './components/external-accounts-edit-form'
import ExternalAccountsListView from './components/external-accounts-list-view'
import LabelsFormSkeleton from './components/external-accounts-skeleton'

import {
  useCreateUserMailboxMutation,
  useDeleteUserMailboxMutation,
  useGetUserMailboxesQuery,
  useUpdateUserMailboxMutation,
} from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'

import { mapApiToMailboxSettings } from '@/features/user-settings/mail/external-accounts/store/mailboxes-utils'
import { getExistingErrorMessage } from '@/lib/redux/api/error-handlers'
import { MODE_CREATE, MODE_EDIT, MODE_LIST } from './external-accounts-utils'

type ViewMode = typeof MODE_LIST | typeof MODE_EDIT | typeof MODE_CREATE

const MailExternalAccountSettings = () => {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const [mode, setMode] = useState<ViewMode>(MODE_LIST)
  const [selectedAccountId, setSelectedAccountId] = useState<string>()
  const { data, error, isFetching } = useGetUserMailboxesQuery()
  const [update] = useUpdateUserMailboxMutation()
  const [create] = useCreateUserMailboxMutation()
  const [deleteMailbox] = useDeleteUserMailboxMutation()
  const fetchedData = data?.data
    ?.filter((i) => i.id !== '0')
    .map((i) => mapApiToMailboxSettings(i))

  const handleEdit = (accountId: string) => {
    setSelectedAccountId(accountId)
    setMode(MODE_EDIT)
  }

  const handleAdd = () => {
    setMode(MODE_CREATE)
  }

  const handleBack = () => {
    setMode(MODE_LIST)
    setSelectedAccountId(undefined)
  }

  const handleCreateSuccess = () => {
    setMode(MODE_LIST)
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>

      {isFetching ? (
        <LabelsFormSkeleton />
      ) : (
        <>
          {mode === MODE_LIST && fetchedData && (
            <ExternalAccountsListView
              onEdit={handleEdit}
              onAdd={handleAdd}
              data={fetchedData}
              isLoading={isFetching}
              deleteMailbox={deleteMailbox}
              error={getExistingErrorMessage(error)}
            />
          )}

          {mode === MODE_EDIT && fetchedData && selectedAccountId && (
            <ExternalAccountForm
              mode={MODE_EDIT}
              data={fetchedData?.filter((i) => i.id === selectedAccountId)[0]}
              onBack={handleBack}
              manageData={update}
              error={getExistingErrorMessage(error)}
            />
          )}

          {mode === MODE_CREATE && (
            <ExternalAccountForm
              mode={MODE_CREATE}
              onBack={handleBack}
              manageData={create}
              error={getExistingErrorMessage(error)}
              onSuccess={handleCreateSuccess}
            />
          )}
        </>
      )}
    </div>
  )
}

export default MailExternalAccountSettings
