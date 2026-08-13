'use client'

import { useCallback } from 'react'
import { getAuthUserId } from '../auth/get-auth-token'
import {
  getCachedFolders,
  getMailBody,
  listCachedMailHeaders,
  purgeExpiredCache,
  saveCachedFolders,
  saveMailBody,
  saveMailHeaders,
} from '../db/mail-cache-store'
import { isPwaMailCacheEnabled } from '../flags'
import type { CachedMailBodyRecord, CachedMailHeaderRecord } from '../types'

export function useMailCache() {
  const cacheFolders = useCallback(
    async (accountId: string, folders: unknown) => {
      if (!isPwaMailCacheEnabled()) return
      const userId = getAuthUserId()
      if (!userId) return
      await saveCachedFolders({
        id: `${userId}:${accountId}`,
        userId,
        accountId,
        foldersJson: JSON.stringify(folders),
        updatedAt: Date.now(),
      })
    },
    []
  )

  const readFolders = useCallback(async (accountId: string) => {
    if (!isPwaMailCacheEnabled()) return null
    const userId = getAuthUserId()
    if (!userId) return null
    const row = await getCachedFolders(userId, accountId)
    if (!row) return null
    try {
      return JSON.parse(row.foldersJson)
    } catch {
      return null
    }
  }, [])

  const cacheHeaders = useCallback(
    async (
      accountId: string,
      folderPath: string,
      headers: Omit<CachedMailHeaderRecord, 'id' | 'userId' | 'updatedAt'>[]
    ) => {
      if (!isPwaMailCacheEnabled()) return
      const userId = getAuthUserId()
      if (!userId) return
      const now = Date.now()
      await saveMailHeaders(
        userId,
        headers.map((h) => ({
          ...h,
          id: `${userId}:${accountId}:${folderPath}:${h.mailId}`,
          userId,
          updatedAt: now,
        }))
      )
    },
    []
  )

  const readHeaders = useCallback(
    async (accountId: string, folderPath: string) => {
      if (!isPwaMailCacheEnabled()) return []
      const userId = getAuthUserId()
      if (!userId) return []
      return listCachedMailHeaders(userId, accountId, folderPath)
    },
    []
  )

  const cacheBody = useCallback(
    async (
      accountId: string,
      folderPath: string,
      mailId: string,
      payload: unknown
    ) => {
      if (!isPwaMailCacheEnabled()) return
      const userId = getAuthUserId()
      if (!userId) return
      const now = Date.now()
      const record: CachedMailBodyRecord = {
        id: `${userId}:${accountId}:${folderPath}:${mailId}`,
        userId,
        accountId,
        folderPath,
        mailId,
        payloadJson: JSON.stringify(payload),
        updatedAt: now,
        lastAccessedAt: now,
      }
      await saveMailBody(record)
    },
    []
  )

  const readBody = useCallback(
    async (accountId: string, folderPath: string, mailId: string) => {
      if (!isPwaMailCacheEnabled()) return null
      const userId = getAuthUserId()
      if (!userId) return null
      const row = await getMailBody(
        userId,
        `${userId}:${accountId}:${folderPath}:${mailId}`
      )
      if (!row) return null
      try {
        return JSON.parse(row.payloadJson)
      } catch {
        return null
      }
    },
    []
  )

  const purge = useCallback(async () => {
    const userId = getAuthUserId()
    if (!userId) return
    await purgeExpiredCache(userId)
  }, [])

  return {
    cacheFolders,
    readFolders,
    cacheHeaders,
    readHeaders,
    cacheBody,
    readBody,
    purge,
  }
}
