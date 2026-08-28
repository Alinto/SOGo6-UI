'use client'

import type { ImapFolder, ImapMessagesList } from '@/features/mails/mails-types'
import { mailsApiEndpoints } from '@/features/mails/store/mails-api'
import { useProfile } from '@/features/user-profile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { useEffect } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import { isPwaMailCacheEnabled } from '../flags'
import { useMailCache } from '../hooks/use-mail-cache'
import { useNetworkStatus } from '../network/use-network-status'
import { scheduleIdle } from './folder-tree'
import { prefetchInboxCache } from './inbox-prefetch'
import { startQuery } from './start-query'

const LIST_PARAMS = {
  fields: 'contents',
  fields_action: 'exclude',
} as const

export function useInboxPrefetch() {
  const dispatch = useAppDispatch()
  const { mainAccount } = useProfile()
  const userId = useAppSelector((state) => state.auth.user?.uid)
  const { isOnline, isProbing } = useNetworkStatus()
  const { cacheFolders, cacheHeaders, cacheBody } = useMailCache()
  const accountId = mainAccount?.id ?? '0'

  useEffect(() => {
    if (!isPwaMailCacheEnabled() || !userId || !isOnline || isProbing) return
    const authUserId = getAuthUserId()
    if (!authUserId) return

    const cancelIdle = scheduleIdle(() => {
      void prefetchInboxCache(
        authUserId,
        accountId,
        {
          fetchFolders: async () => {
            const sub = startQuery<ImapFolder[]>(
              dispatch,
              mailsApiEndpoints.endpoints.getFolders.initiate({ accountId })
            )
            try {
              return (await sub.unwrap()) ?? []
            } finally {
              sub.unsubscribe()
            }
          },
          fetchFolderMails: async (folder, pageSize) => {
            const sub = startQuery<{ mails?: ImapMessagesList[] }>(
              dispatch,
              mailsApiEndpoints.endpoints.getFolderMessages.initiate({
                accountId,
                folder,
                params: { ...LIST_PARAMS, page_size: String(pageSize) },
              })
            )
            try {
              const data = await sub.unwrap()
              return data?.mails ?? []
            } finally {
              sub.unsubscribe()
            }
          },
          fetchMail: async (folder, mailId) => {
            const sub = startQuery<unknown>(
              dispatch,
              mailsApiEndpoints.endpoints.getMail.initiate({
                accountId,
                folder,
                mailId,
                skipMarkRead: true,
              })
            )
            try {
              return await sub.unwrap()
            } finally {
              sub.unsubscribe()
            }
          },
        },
        { cacheFolders, cacheHeaders, cacheBody }
      )
    })

    return cancelIdle
  }, [
    accountId,
    cacheBody,
    cacheFolders,
    cacheHeaders,
    dispatch,
    isOnline,
    isProbing,
    userId,
  ])
}
