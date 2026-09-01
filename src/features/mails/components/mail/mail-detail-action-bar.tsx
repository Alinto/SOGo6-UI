'use client'

import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useMailDetailFolderActions } from '@/features/mails/hooks/use-mail-detail-folder-actions'
import { useMailItemActions } from '@/features/mails/hooks/use-mail-item-actions'
import type { ImapFolderType } from '@/features/mails/mails-types'
import {
  useDownloadMailMutation,
  useLazyGetMailRawQuery,
} from '@/features/mails/store/mails-api'
import { useRouter } from '@/lib/i18n/navigation'
import { Inbox, Mail, ShieldX, Star, Tag, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import MailActionsBar from './mail-action-bar'
import {
  MailActionConfirmDialog,
  type MailActionConfirmVariant,
} from './mail-action-confirm-dialog'
import MailLabelPickerDialog from './mail-label-picker-dialog'
import MailMoreActionsMenu from './mail-more-actions-menu'
import MailMoveCopyMenu, {
  type MailMoveCopyMenuMode,
} from './mail-move-copy-menu'
import MailMoveDialog from './mail-move-dialog'
import { ActionId, type Action } from './types'

export type MailDetailActionBarProps = {
  accountId: string
  folder: string
  folderType?: ImapFolderType
  mailId: string
  mail?: import('@/features/mails/mails-types').ImapMessages
  seen: boolean
  flagged?: boolean
  flags?: string[]
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
  flagged = false,
  flags = [],
  enableLabel = true,
  enableDesktopMore = true,
  onPrint,
  isPrintDisabled = false,
}: MailDetailActionBarProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const { push } = useRouter()
  const { folderType: resolvedFolderType } = useCurrentFolder(folder, accountId)
  const folderType = folderTypeProp ?? resolvedFolderType
  const { folderSpecificActions, handleFolderSpecificAction } =
    useMailDetailFolderActions({
      folderType,
      folder,
      accountId,
      mailId,
      mail,
    })
  const [confirmVariant, setConfirmVariant] =
    useState<MailActionConfirmVariant | null>(null)
  const [labelOpen, setLabelOpen] = useState(false)
  const [createFolderMode, setCreateFolderMode] =
    useState<MailMoveCopyMenuMode | null>(null)

  const handleRemoved = useCallback(() => {
    push(`/u/${accountId}/${encodeURIComponent(folder)}`)
  }, [accountId, folder, push])

  const {
    deleteMail,
    markUnread,
    markSpam,
    markHam,
    archiveMail,
    moveMail,
    copyMail,
    applyLabel,
    removeLabel,
    markImportant,
    removeImportant,
    isJunk,
    isLoading,
  } = useMailItemActions({
    accountId,
    folder,
    mailId,
    seen,
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
        case ActionId.IMPORTANT:
          void (flagged ? removeImportant() : markImportant())
          break
        default:
          break
      }
    },
    [
      isLoading,
      openConfirm,
      markUnread,
      enableLabel,
      flagged,
      markImportant,
      removeImportant,
      handleFolderSpecificAction,
    ]
  )

  const handleSelectMoveCopyDestination = useCallback(
    (mode: MailMoveCopyMenuMode, destination: string) => {
      void (mode === 'copy' ? copyMail(destination) : moveMail(destination))
    },
    [moveMail, copyMail]
  )

  const spamOrHamAction: Action = isJunk
    ? {
        id: ActionId.HAM,
        icon: <Inbox size={18} />,
        title: t('report_not_spam.string'),
        disabled: isLoading,
      }
    : {
        id: ActionId.SPAM,
        icon: <ShieldX size={18} />,
        title: t('report_spam.string'),
        disabled: isLoading,
      }

  const desktopActions: Action[] = [
    ...folderSpecificActions,
    {
      id: ActionId.IMPORTANT,
      icon: (
        <Star
          size={18}
          className={flagged ? 'fill-yellow-400 text-yellow-400' : undefined}
        />
      ),
      title: flagged
        ? t('unmark_important.string')
        : t('mark_important.string'),
      disabled: isLoading,
    },
    {
      id: ActionId.MARK_UNREAD,
      icon: <Mail size={18} />,
      title: t('mark_unread.string'),
      disabled: isLoading || seen === false,
    },
    {
      id: ActionId.DELETE,
      icon: <Trash2 size={18} />,
      title: t('delete.string'),
      disabled: isLoading,
    },
    spamOrHamAction,

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
      showArchive
      showDownload
      showSpamActions
      showLabel
      showMoveCopy
      showPrint={false}
      showViewSource
      folderSpecificActions={folderSpecificActions}
      accountId={accountId}
      currentFolder={folder}
      onMarkUnread={() => void markUnread()}
      onLabel={() => setLabelOpen(true)}
      onMarkSpam={() => openConfirm('spam')}
      onMarkHam={() => openConfirm('ham')}
      onFolderSpecificAction={handleFolderSpecificAction}
      onArchive={() => void archiveMail()}
      onDownload={() => void handleDownload()}
      onViewSource={() => void handleViewSource()}
      onSelectDestination={handleSelectMoveCopyDestination}
      onCreateFolder={setCreateFolderMode}
    />
  )

  const desktopMoreMenu = enableDesktopMore ? (
    <MailMoreActionsMenu
      disabled={isLoading}
      showArchive
      showDownload
      showPrint
      showViewSource
      onArchive={() => void archiveMail()}
      onDownload={() => void handleDownload()}
      onPrint={onPrint}
      printDisabled={isPrintDisabled}
      onViewSource={() => void handleViewSource()}
      triggerClassName="rounded-r-md"
    />
  ) : null

  return (
    <>
      <div className="flex gap-2 sm:hidden">
        <MailActionsBar
          actions={[
            {
              id: ActionId.MARK_UNREAD,
              icon: <Mail size={18} />,
              title: t('mark_unread.string'),
              disabled: isLoading || seen === false,
            },
            {
              id: ActionId.DELETE,
              icon: <Trash2 size={18} />,
              title: t('delete.string'),
              disabled: isLoading,
            },
          ]}
          onAction={(_idx, action) => {
            if (action.id === ActionId.DELETE) openConfirm('delete')
            else if (action.id === ActionId.MARK_UNREAD) void markUnread()
          }}
        />
        {mobileMoreMenu}
      </div>
      <div className="hidden items-center sm:inline-flex">
        <MailActionsBar actions={desktopActions} onAction={handleMainAction}>
          <MailMoveCopyMenu
            accountId={accountId}
            currentFolder={folder}
            disabled={isLoading}
            onSelectDestination={handleSelectMoveCopyDestination}
            onCreateFolder={setCreateFolderMode}
            triggerClassName={desktopMoreMenu ? undefined : 'rounded-r-md'}
          />
          {desktopMoreMenu}
        </MailActionsBar>
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

      <MailMoveDialog
        open={createFolderMode != null}
        onOpenChange={(open) => {
          if (!open) setCreateFolderMode(null)
        }}
        accountId={accountId}
        currentFolder={folder}
        isLoading={isLoading}
        mode={createFolderMode ?? 'move'}
        onConfirm={async (destination) => {
          await (createFolderMode === 'copy'
            ? copyMail(destination)
            : moveMail(destination))
          setCreateFolderMode(null)
        }}
      />
    </>
  )
}
