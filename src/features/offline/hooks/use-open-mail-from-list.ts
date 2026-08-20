'use client'

import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useParams } from 'next/navigation'
import { useCallback } from 'react'
import { useOfflineNav } from '../offline-nav-context'

/**
 * Open a mail from the list. Offline, never Next.js-navigate: a hard
 * navigation would hit the SW `/~offline` page even if the body is in IDB.
 */
export function useOpenMailFromList() {
  const { openMail, view, folderPathOverride, clearUnavailable } =
    useOfflineNav()
  const { account, folder } = useParams()
  const accountId = Array.isArray(account) ? account[0] : (account ?? '0')
  const folderPath =
    folderPathOverride ??
    folderPathFromParams(folder as string | string[] | undefined)

  const handleOpen = useCallback(
    async (mailId: string) => {
      await openMail(accountId, folderPath, String(mailId))
    },
    [accountId, folderPath, openMail]
  )

  return {
    openMail: handleOpen,
    unavailable: view.kind === 'unavailable',
    dismissUnavailable: clearUnavailable,
  }
}
