'use client'

import { folderPathFromParams } from '@/features/mails/utils/folder-path-from-params'
import type { MailNavigationContext } from '@/features/mails/utils/mail-detail-navigation'
import {
  isMailDetailPath,
  resolveMailIdFromPath,
} from '@/features/mails/utils/mail-detail-navigation'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export function useMailDetailNavigation() {
  const params = useParams()
  const pathname = usePathname()
  const { push } = useRouter()
  const mailNavigation = useAppSelector((state) => state.mailNavigation)

  const account = Array.isArray(params.account)
    ? params.account[0]
    : (params.account ?? '')
  const folder = folderPathFromParams(
    params.folder as string | string[] | undefined
  )

  const isOnMailDetailPath = isMailDetailPath(pathname, folder)

  const mailIdParam = Array.isArray(params.mail_id)
    ? params.mail_id[0]
    : params.mail_id

  const mailId = useMemo(() => {
    if (!isOnMailDetailPath) return null
    if (mailIdParam) return mailIdParam
    return resolveMailIdFromPath(pathname, folder)
  }, [isOnMailDetailPath, mailIdParam, pathname, folder])

  const folderKey = `${account}/${folder}`
  const isNavigationValid = mailNavigation.folderKey === folderKey
  const currentIndex =
    mailId && isNavigationValid
      ? mailNavigation.orderedIds.indexOf(mailId)
      : -1

  const prevId =
    currentIndex > 0 ? mailNavigation.orderedIds[currentIndex - 1] : null
  const nextId =
    currentIndex !== -1 && currentIndex < mailNavigation.orderedIds.length - 1
      ? mailNavigation.orderedIds[currentIndex + 1]
      : null

  const isFirstOfPage = currentIndex === 0
  const isLastOfPage = currentIndex === mailNavigation.orderedIds.length - 1
  const hasPrevPage = mailNavigation.page > 1
  const hasNextPage = mailNavigation.page < mailNavigation.totalPages

  const canGoPrev =
    Boolean(prevId) || (isNavigationValid && isFirstOfPage && hasPrevPage)
  const canGoNext =
    Boolean(nextId) || (isNavigationValid && isLastOfPage && hasNextPage)

  const encodedFolder = encodeURIComponent(folder)

  const goPrev = useCallback(() => {
    if (!mailId) return
    if (prevId) {
      push(
        `/u/${account}/${encodedFolder}/${encodeURIComponent(prevId)}`
      )
    } else if (isNavigationValid && isFirstOfPage && hasPrevPage) {
      push(`/u/${account}/${encodedFolder}?page=${mailNavigation.page - 1}`)
    }
  }, [
    mailId,
    prevId,
    push,
    account,
    encodedFolder,
    isNavigationValid,
    isFirstOfPage,
    hasPrevPage,
    mailNavigation.page,
  ])

  const goNext = useCallback(() => {
    if (!mailId) return
    if (nextId) {
      push(
        `/u/${account}/${encodedFolder}/${encodeURIComponent(nextId)}`
      )
    } else if (isNavigationValid && isLastOfPage && hasNextPage) {
      push(`/u/${account}/${encodedFolder}?page=${mailNavigation.page + 1}`)
    }
  }, [
    mailId,
    nextId,
    push,
    account,
    encodedFolder,
    isNavigationValid,
    isLastOfPage,
    hasNextPage,
    mailNavigation.page,
  ])

  const navigationContext: MailNavigationContext = mailNavigation

  return {
    mailId,
    isActive: Boolean(mailId),
    isOnMailDetailPath,
    canGoPrev,
    canGoNext,
    goPrev,
    goNext,
    currentPosition: currentIndex >= 0 ? currentIndex + 1 : null,
    totalInPage: isNavigationValid ? mailNavigation.orderedIds.length : null,
    navigation: navigationContext,
  }
}
