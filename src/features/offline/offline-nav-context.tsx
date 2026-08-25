'use client'

import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import { useRouter } from '@/lib/i18n/navigation'
import { useParams } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAuthUserId } from './auth/get-auth-token'
import { isPwaMailCacheEnabled, isPwaOutboxEnabled } from './flags'
import { useMailCache } from './hooks/use-mail-cache'
import { shouldSkipDocumentNav } from './network/skip-document-nav'
import { useNetworkStatus } from './network/use-network-status'

export type OfflineUnavailableTarget = 'mail' | 'folder'

export type OfflineNavView =
  | { kind: 'route' }
  | { kind: 'outbox' }
  | { kind: 'folder'; path: string }
  | {
      kind: 'unavailable'
      target: OfflineUnavailableTarget
      path: string
      label?: string
    }
  | {
      kind: 'mail'
      accountId: string
      folderPath: string
      mailId: string
    }

function folderPathOverrideFromView(view: OfflineNavView): string | null {
  if (view.kind === 'folder' || view.kind === 'unavailable') return view.path
  if (view.kind === 'mail') return view.folderPath
  return null
}

interface OfflineNavApi {
  view: OfflineNavView
  folderPathOverride: string | null
  openFolder: (accountId: string, path: string, label?: string) => Promise<void>
  openOutbox: (accountId: string) => void
  openMail: (
    accountId: string,
    folderPath: string,
    mailId: string
  ) => Promise<void>
  closeOverlay: () => void
  clearUnavailable: () => void
}

const OfflineNavContext = createContext<OfflineNavApi | null>(null)

function useRouteFallback(): OfflineNavApi {
  const { push } = useRouter()
  return useMemo(
    () => ({
      view: { kind: 'route' },
      folderPathOverride: null,
      openFolder: async (accountId: string, path: string, _label?: string) => {
        push(`/u/${accountId}/${encodeURIComponent(path)}`)
      },
      openOutbox: (accountId: string) => {
        push(`/u/${accountId}/outbox`)
      },
      openMail: async (
        accountId: string,
        folderPath: string,
        mailId: string
      ) => {
        push(`/u/${accountId}/${encodeURIComponent(folderPath)}/${mailId}`)
      },
      closeOverlay: () => {},
      clearUnavailable: () => {},
    }),
    [push]
  )
}

export function OfflineNavProvider({ children }: { children: ReactNode }) {
  const { push } = useRouter()
  const { folder: urlFolderParam } = useParams() ?? {}
  const urlFolder = folderPathFromParams(
    urlFolderParam as string | string[] | undefined
  )
  const { isOnline, isProbing } = useNetworkStatus()
  const skipNav = shouldSkipDocumentNav(isOnline, isProbing)
  const { readHeaders, readBody } = useMailCache()
  const [view, setView] = useState<OfflineNavView>({ kind: 'route' })

  const openFolder = useCallback(
    async (accountIdArg: string, path: string, label?: string) => {
      if (!isPwaMailCacheEnabled() || !skipNav) {
        setView({ kind: 'route' })
        push(`/u/${accountIdArg}/${encodeURIComponent(path)}`)
        return
      }
      const rows = await readHeaders(accountIdArg, path)
      if (rows.length > 0) {
        setView({ kind: 'folder', path })
        return
      }
      setView({
        kind: 'unavailable',
        target: 'folder',
        path,
        label,
      })
    },
    [push, readHeaders, skipNav]
  )

  const openOutbox = useCallback(
    (accountIdArg: string) => {
      if (!isPwaOutboxEnabled() || !skipNav) {
        setView({ kind: 'route' })
        push(`/u/${accountIdArg}/outbox`)
        return
      }
      setView({ kind: 'outbox' })
    },
    [push, skipNav]
  )

  const openMail = useCallback(
    async (accountIdArg: string, folderPath: string, mailId: string) => {
      if (!isPwaMailCacheEnabled() || !skipNav) {
        setView({ kind: 'route' })
        push(`/u/${accountIdArg}/${encodeURIComponent(folderPath)}/${mailId}`)
        return
      }
      const userId = getAuthUserId()
      const body = userId
        ? await readBody(accountIdArg, folderPath, String(mailId))
        : null
      if (!body) {
        setView({
          kind: 'unavailable',
          target: 'mail',
          path: folderPath,
        })
        return
      }
      setView({
        kind: 'mail',
        accountId: accountIdArg,
        folderPath,
        mailId: String(mailId),
      })
    },
    [push, readBody, skipNav]
  )

  const closeOverlay = useCallback(() => {
    setView((current) => {
      if (current.kind === 'mail') {
        if (current.folderPath !== urlFolder) {
          return { kind: 'folder', path: current.folderPath }
        }
        return { kind: 'route' }
      }
      if (current.kind === 'outbox' || current.kind === 'unavailable') {
        return { kind: 'route' }
      }
      return current
    })
  }, [urlFolder])

  const clearUnavailable = useCallback(() => {
    setView((current) =>
      current.kind === 'unavailable' ? { kind: 'route' } : current
    )
  }, [])

  const value = useMemo<OfflineNavApi>(
    () => ({
      view,
      folderPathOverride: folderPathOverrideFromView(view),
      openFolder,
      openOutbox,
      openMail,
      closeOverlay,
      clearUnavailable,
    }),
    [clearUnavailable, closeOverlay, openFolder, openMail, openOutbox, view]
  )

  return (
    <OfflineNavContext.Provider value={value}>
      {children}
    </OfflineNavContext.Provider>
  )
}

export function useOfflineNav(): OfflineNavApi {
  const ctx = useContext(OfflineNavContext)
  const fallback = useRouteFallback()
  return ctx ?? fallback
}
