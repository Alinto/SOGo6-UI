'use client'

import { useMailItemActions } from '@/features/mails/hooks/use-mail-item-actions'
import { useMailDetailFolderActions } from '@/features/mails/hooks/use-mail-detail-folder-actions'
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import type { ImapFolderType } from '@/features/mails/mails-types'
import { useDownloadMailMutation, useLazyGetMailRawQuery } from '@/features/mails/store/mails-api'
import type { MailNavigationContext } from '@/features/mails/utils/mail-detail-navigation'
import { useRouter } from '@/lib/i18n/navigation'
import { Flame, Inbox, Mail, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useState } from 'react'
import MailActionsBar from './mail-action-bar'
import {
  MailActionConfirmDialog,
  type MailActionConfirmVariant,
} from './mail-action-confirm-dialog'
import MailLabelPickerDialog from './mail-label-picker-dialog'
import MailMoreActionsMenu from './mail-more-actions-menu'
import { ActionId, type Action } from './types'

export type MailDetailActionBarProps = {
  accountId: string
  folder: string
  folderType?: ImapFolderType
  mailId: string
  mail?: import('@/features/mails/mails-types').ImapMessages
  seen: boolean
  flags?: string[]
  navigation?: MailNavigationContext
  enableLabel?: boolean
  enableDesktopMore?: boolean
  onPrint?: () => void
  isPrintDisabled?: boolean
}

export default function MailDetailActionBar({
  accountId,
  folder,
  folderType: folderTypeProp,
  mailId,
  mail,
  seen,
  flags = [],
  navigation,
  enableLabel = true,
  enableDesktopMore = true,
  onPrint,
  isPrintDisabled = false,
}: MailDetailActionBarProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const { push } = useRouter()
  const { folderType: resolvedFolderType } = useCurrentFolder(folder, accountId)
  const folderType = folderTypeProp ?? resolvedFolderType
  const {
    folderSpecificActions,
    handleFolderSpecificAction,
  } = useMailDetailFolderActions({
    folderType,
    folder,
    accountId,
    mailId,
    mail,
  })
  const [confirmVariant, setConfirmVariant] =
    useState<MailActionConfirmVariant | null>(null)
  const [labelOpen, setLabelOpen] = useState(false)

  const handleRemoved = useCallback(
    (result: { target: 'next' | 'prev' | 'list'; id?: string }) => {
      const encodedFolder = encodeURIComponent(folder)
      const base = `/u/${accountId}/${encodedFolder}`
      if (result.target === 'list') {
        push(base)
      } else if (result.id) {
        push(`${base}/${encodeURIComponent(result.id)}`)
      }
    },
    [accountId, folder, push]
  )

  const {
    deleteMail,
    markUnread,
    markSpam,
    markHam,
    archiveMail,
    applyLabel,
    removeLabel,
    isJunk,
    isLoading,
  } = useMailItemActions({
    accountId,
    folder,
    mailId,
    seen,
    navigation,
    onRemoved: handleRemoved,
  })

  const [downloadMail] = useDownloadMailMutation()
  const [fetchRaw] = useLazyGetMailRawQuery()

  const openConfirm = useCallback((variant: MailActionConfirmVariant) => {
    setConfirmVariant(variant)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!confirmVariant) return
    const run = async () => {
      try {
        if (confirmVariant === 'delete') await deleteMail()
        else if (confirmVariant === 'spam') await markSpam()
        else if (confirmVariant === 'ham') await markHam()
        setConfirmVariant(null)
      } catch {
        // notifications handle errors
      }
    }
    void run()
  }, [confirmVariant, deleteMail, markSpam, markHam])

  const handleDownload = useCallback(async () => {
    try {
      const blob = await downloadMail({
        accountId,
        folder,
        mailId,
        format: 'eml',
      }).unwrap()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mail-${mailId}.eml`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // notification from mutation if added later
    }
  }, [downloadMail, accountId, folder, mailId])

  const handleViewSource = useCallback(async () => {
    try {
      const raw = await fetchRaw({ accountId, folder, mailId }).unwrap()
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(`<pre>${raw.replace(/</g, '&lt;')}</pre>`)
        w.document.close()
      }
    } catch {
      // silent
    }
  }, [fetchRaw, accountId, folder, mailId])

  const handleMainAction = useCallback(
    (_idx: number, action: Action) => {
      if (action.disabled || isLoading) return
      if (handleFolderSpecificAction(action)) return
      switch (action.id) {
        case ActionId.DELETE:
          openConfirm('delete')
          break
        case ActionId.SPAM:
          openConfirm('spam')
          break
        case ActionId.HAM:
          openConfirm('ham')
          break
        case ActionId.MARK_UNREAD:
          void markUnread()
          break
        case ActionId.LABEL:
          if (enableLabel) setLabelOpen(true)
          break
        default:
          break
      }
    },
    [isLoading, openConfirm, markUnread, enableLabel, handleFolderSpecificAction]
  )

  const spamOrHamAction: Action = isJunk
    ? {
        id: ActionId.HAM,
        icon: <Inbox size={18} />,
        title: t('move_to_inbox.string'),
        disabled: isLoading,
      }
    : {
        id: ActionId.SPAM,
        icon: <Flame size={18} />,
        title: t('report_spam.string'),
        disabled: isLoading,
      }

  const desktopActions: Action[] = [
    ...folderSpecificActions,
    {
      id: ActionId.DELETE,
      icon: <Trash2 size={18} />,
      title: t('delete.string'),
      disabled: isLoading,
    },
    spamOrHamAction,
    {
      id: ActionId.MARK_UNREAD,
      icon: <Mail size={18} />,
      title: t('mark_unread.string'),
      disabled: isLoading || seen === false,
    },
    {
      id: ActionId.LABEL,
      icon: <Tag size={18} />,
      title: t('label.string'),
      disabled: isLoading || !enableLabel,
    },
  ]

  const mobileMoreMenu = (
    <MailMoreActionsMenu
      disabled={isLoading}
      isJunk={isJunk}
      markUnreadDisabled={seen === false}
      labelDisabled={!enableLabel}
      showArchive={false}
      showDownload={false}
      showMove={false}
      showPrint={false}
      showViewSource={false}
      onMarkSpam={() => openConfirm('spam')}
      onMarkHam={() => openConfirm('ham')}
      onMarkUnread={() => void markUnread()}
      onLabel={() => setLabelOpen(true)}
    />
  )

  const desktopMoreMenu = enableDesktopMore ? (
    <MailMoreActionsMenu
      disabled={isLoading}
      showSpamActions={false}
      showUnread={false}
      showLabel={false}
      showArchive
      showDownload
      showMove={false}
      showPrint
      showViewSource
      onArchive={() => void archiveMail()}
      onDownload={() => void handleDownload()}
      onPrint={onPrint}
      printDisabled={isPrintDisabled}
      onViewSource={() => void handleViewSource()}
      triggerClassName="rounded-none"
    />
  ) : null

  return (
    <>
      <div className="flex gap-2 sm:hidden">
        <MailActionsBar
          actions={[
            {
              id: ActionId.DELETE,
              icon: <Trash2 size={18} />,
              title: t('delete.string'),
              disabled: isLoading,
            },
          ]}
          onAction={(_idx, action) => {
            if (action.id === ActionId.DELETE) openConfirm('delete')
          }}
        />
        {mobileMoreMenu}
      </div>
      <div className="hidden items-center sm:inline-flex">
        <MailActionsBar
          actions={desktopActions}
          onAction={handleMainAction}
          className="rounded-r-none border-r-0"
        />
        {desktopMoreMenu ? (
          <div className="inline-flex items-center rounded-md rounded-l-none border border-l-0 py-1 pr-1 shadow-sm">
            {desktopMoreMenu}
          </div>
        ) : null}
      </div>

      <MailActionConfirmDialog
        open={confirmVariant != null}
        onOpenChange={(open) => {
          if (!open) setConfirmVariant(null)
        }}
        variant={confirmVariant ?? 'delete'}
        isLoading={isLoading}
        onConfirm={handleConfirm}
      />

      {enableLabel ? (
        <MailLabelPickerDialog
          open={labelOpen}
          onOpenChange={setLabelOpen}
          appliedFlags={flags}
          onApplyLabel={applyLabel}
          onRemoveLabel={removeLabel}
          isLoading={isLoading}
        />
      ) : null}
    </>
  )
}
