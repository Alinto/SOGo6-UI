'use client'

import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { keptListQuery } from '@/features/mails/utils/mail-detail-navigation'
import { useParams, useSearchParams } from 'next/navigation'
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
  // Keep the list's quick filter in the mail URL (split view, back to list).
  const listQuery = keptListQuery(useSearchParams())
  const accountId = Array.isArray(account) ? account[0] : (account ?? '0')
  const routeFolderPath =
    folderPathOverride ??
    folderPathFromParams(folder as string | string[] | undefined)

  const handleOpen = useCallback(
    // mailFolder is the mail's actual folder (search results can span
    // multiple folders); it takes precedence over the route's folder.
    async (mailId: string, mailFolder?: string) => {
      await openMail(
        accountId,
        mailFolder ?? routeFolderPath,
        String(mailId),
        listQuery
      )
    },
    [accountId, routeFolderPath, openMail, listQuery]
  )

  return {
    openMail: handleOpen,
    unavailable: view.kind === 'unavailable',
    dismissUnavailable: clearUnavailable,
  }
}
