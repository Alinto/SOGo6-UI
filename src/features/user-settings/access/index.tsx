'use client'

import { Button } from '@/components/ui/button'
import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { Plus, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import AddUserDialog from './components/add-user-dialog'
import GlobalAccessSkeleton from './components/global-access-skeleton'
import GlobalAccessUserRow from './components/global-access-user-row'
import type { GlobalAccessUserEntry } from './store/access-api'
import { useGetGlobalAccessQuery } from './store/access-api'

const GlobalAccessSettings: React.FC = () => {
  const t = useTranslations('US_ACCESS')
  const { data, error, isLoading } = useGetGlobalAccessQuery()
  const [pendingUsers, setPendingUsers] = React.useState<GlobalAccessUserEntry[]>([])
  const [addUserOpen, setAddUserOpen] = React.useState(false)

  const entries = React.useMemo(() => {
    const known = data ?? []
    const knownKeys = new Set(known.map((entry) => entry.key))
    const stillPending = pendingUsers.filter((entry) => !knownKeys.has(entry.key))
    return [...known, ...stillPending].sort((a, b) =>
      (a.c_email ?? a.uid).localeCompare(b.c_email ?? b.uid)
    )
  }, [data, pendingUsers])

  const existingKeys = React.useMemo(
    () => new Set(entries.map((entry) => entry.key)),
    [entries]
  )

  const handleAddUser = (email: string): void => {
    const key = email.toLowerCase()
    setPendingUsers((prev) => [
      ...prev,
      { key, uid: email, c_email: email, grants: [] },
    ])
  }

  const handleRemovePending = (key: string): void => {
    setPendingUsers((prev) => prev.filter((entry) => entry.key !== key))
  }

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<GlobalAccessSkeleton />}
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={() => setAddUserOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {t('addUser.button.string')}
          </Button>
        </div>

        {entries.length === 0 ? (
          <div className="text-muted-foreground py-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">{t('empty.string')}</p>
          </div>
        ) : (
          <div className="rounded-lg border px-4">
            {entries.map((entry) => (
              <GlobalAccessUserRow
                key={entry.key}
                entry={entry}
                onRemovePending={() => handleRemovePending(entry.key)}
              />
            ))}
          </div>
        )}
      </div>

      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        existingKeys={existingKeys}
        onAdd={handleAddUser}
      />
    </SettingsAsyncPage>
  )
}

export default GlobalAccessSettings
