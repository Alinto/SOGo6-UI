'use client'

import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { flattenMailFolders } from '@/features/user-settings/access/utils/owned-items'
import { useGetFoldersQuery } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import { Folder } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import MailAccessListRow from './components/mail-access-list-row'
import MailAccessSkeleton from './components/mail-access-skeleton'

const MailAccessSettings: React.FC = () => {
  const t = useTranslations('US_MAIL_ACCESS')
  const { mainAccount, folderSharingDisabled } = useProfile()
  const accountId = mainAccount?.id ?? '0'

  const { data, error, isLoading } = useGetFoldersQuery({ accountId })
  const folders = React.useMemo(() => flattenMailFolders(data ?? []), [data])
  const isDisabled = folderSharingDisabled.includes('mail')

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<MailAccessSkeleton />}
    >
      {isDisabled ? (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {t('disabled.string')}
        </div>
      ) : folders.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          <Folder className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">{t('empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {folders.map((folder) => (
            <MailAccessListRow
              key={folder.path}
              accountId={accountId}
              folder={folder}
            />
          ))}
        </div>
      )}
    </SettingsAsyncPage>
  )
}

export default MailAccessSettings
