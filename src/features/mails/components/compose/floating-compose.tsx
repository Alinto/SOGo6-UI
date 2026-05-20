'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProfile } from '@/features/user-profile'
import { useInterval } from '@/hooks/use-interval'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  Minus,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  Paperclip,
  Send,
  Trash,
  Video,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { closeDraft, setActiveDraft } from '../../store'
import {
  useDeleteMailMutation,
  useSaveDraftMutation,
  useSendMailMutation,
} from '../../store/mail-api'
import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_LOW,
  MAIL_PRIORITY_LOWEST,
  MAIL_PRIORITY_NORMAL,
  MailComposeDraft,
  markDraftSaved,
  setPendingInsert,
  toggleReadReceipt,
  updateMailUid,
  updatePriority,
} from '../../store/mail-compose-slice'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import styles from './compose.module.css'

interface FloatingComposeProps {
  draftId: string
}

/**
 * Resolves the mailbox account ID from the selected identity.
 *
 * The identity's mail is matched against mainAccount and externalAccounts
 * to find which account owns it, then returns that account's id.
 * Falls back to '0' (default mailbox) when no match is found.
 */
function resolveAccountId(
  identityMail: string | undefined,
  mainAccount: ReturnType<typeof useProfile>['mainAccount'],
  externalAccounts: ReturnType<typeof useProfile>['externalAccounts']
): string {
  if (!identityMail) return '0'

  // Check main account identities
  const inMain = mainAccount?.identities?.some((id) => id.mail === identityMail)
  if (inMain && mainAccount?.id) return String(mainAccount.id)

  // Check external accounts
  for (const account of externalAccounts) {
    const inExternal = account.identities?.some(
      (id) => id.mail === identityMail
    )
    if (inExternal && account.id) return String(account.id)
  }

  return '0'
}

export const FloatingCompose: React.FC<FloatingComposeProps> = ({
  draftId,
}) => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.mailCompose.drafts[draftId])
  const mailUid = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.mailUid
  )
  const subject = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.subject ?? ''
  )
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const activeDraftId = useAppSelector(
    (state) => state.mailCompose.activeDraftId
  )
  const isActive = activeDraftId === draftId

  const {
    uiSettings,
    jitsiLinkEnabled,
    jitsiBaseUrl,
    mainAccount,
    externalAccounts,
  } = useProfile()

  const SOGO_D_MAIL_DRAFT_AUTOSAVE = uiSettings?.SOGO_D_MAIL_DRAFT_AUTOSAVE

  const selectedPriority = useAppSelector(
    (state) =>
      state.mailCompose.drafts[draftId]?.priority ?? MAIL_PRIORITY_NORMAL
  )

  const requestReadReceipt = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.requestReadReceipt ?? false
  )

  // Selected identity — used to resolve the accountId for the send endpoint
  const selectedIdentity = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.selectedIdentity ?? null
  )

  // Draft recipients / body
  const toRecipients = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.to ?? []
  )

  const ccRecipients = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.cc ?? []
  )
  const bccRecipients = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.bcc ?? []
  )
  const body = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.body ?? ''
  )

  const isDirty = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.isDirty ?? false
  )
  const [sendMail, { isLoading: isSending }] = useSendMailMutation()
  const [saveDraft, { isLoading: isSaving }] = useSaveDraftMutation()
  const [deleteMail, { isLoading: isDeleting }] = useDeleteMailMutation()
  const [showNoRecipientAlert, setShowNoRecipientAlert] = React.useState(false)

  // Maximize on mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsMaximized(true)
    } else {
      setIsMaximized(false)
    }
  }, [isMobile])

  const handleClose = () => {
    handleSaveDraft(false, true)
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsMaximized(false)
    x.set(0)
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsMaximized(false)
    x.set(0)
  }

  const handleMaximize = () => {
    setIsMaximized(true)
    setIsMinimized(false)
    x.set(0)
  }

  const handleInsertJitsi = () => {
    const meetId = Math.random().toString(36).substring(2, 10)
    const link = `${jitsiBaseUrl}/${meetId}`
    dispatch(setPendingInsert(`<a href="${link}">${link}</a>`))
  }

  const handleSaveDraft: (
    displayNotification: boolean,
    closeOnSave: boolean
  ) => Promise<void> = async (displayNotification, closeOnSave) => {
    const accountId = resolveAccountId(
      selectedIdentity.mail,
      mainAccount,
      externalAccounts
    )

    const mailToSend = {
      from: selectedIdentity.mail,
      to: toRecipients.map((r) => r.email),
      cc: ccRecipients.map((r) => r.email),
      bcc: bccRecipients.map((r) => r.email),
      subject,
      body,
      return_receipt: requestReadReceipt ? true : null,
      attachments: [],
    }

    const { attachments, ...data } = mailToSend

    const result = await saveDraft({
      accountId,
      mailUid: mailUid,
      mail: data,
      displayNotification,
    })

    // Only on success
    if (!('error' in result)) {
      dispatch(markDraftSaved({ draftId }))
      if ('data' in result && result?.data?.data?.uid) {
        dispatch(updateMailUid({ draftId, mailUid: result?.data?.data?.uid }))
      }
      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
    }
  }

  // Trigger useInterval every SOGO_D_CARDAV_ENABLED defined seconds (or 5s). Save draft only if unsaved changes
  useInterval(
    () => {
      if (isDirty) void handleSaveDraft(false, false)
    },
    SOGO_D_MAIL_DRAFT_AUTOSAVE ? SOGO_D_MAIL_DRAFT_AUTOSAVE * 1000 : 5000,
    !isMinimized
  )

  const handleDiscardDraft = async () => {
    const accountId = resolveAccountId(
      selectedIdentity.mail,
      mainAccount,
      externalAccounts
    )

    if (mailUid !== null) {
      await deleteMail({
        accountId,
        folder: 'Drafts',
        mailUid: mailUid!,
      })
    }

    dispatch(closeDraft({ draftId }))
  }

  const handleSend = async () => {
    if (!selectedIdentity?.mail) return

    if (toRecipients.length === 0) {
      setShowNoRecipientAlert(true)
      return
    }

    const accountId = resolveAccountId(
      selectedIdentity.mail,
      mainAccount,
      externalAccounts
    )

    const mailToSend = {
      from: selectedIdentity.mail,
      to: toRecipients.map((r) => r.email),
      cc: ccRecipients.map((r) => r.email),
      bcc: bccRecipients.map((r) => r.email),
      subject,
      body,
      return_receipt: requestReadReceipt ? true : null,
      attachments: [],
    }

    const result = await sendMail({
      accountId,
      mail: mailToSend,
      mailUid,
    })

    // Only close on success
    if (!('error' in result)) {
      dispatch(closeDraft({ draftId }))
    }
  }

  if (!draft) return null

  const getContainerClasses = () => {
    const zClass = isActive
      ? 'z-50 shadow-2xl'
      : 'z-40 shadow-md opacity-95 hover:opacity-100'

    if (isMinimized) {
      return `h-12 w-80 ${zClass}`
    }
    if (isMaximized) {
      return `fixed inset-0 !m-auto h-[calc(100vh-2rem)] w-[calc(100vw-8rem)] max-w-[calc(100vw-8rem)] rounded-lg ${zClass}`
    }
    return `h-[550px] w-[540px] max-w-[calc(100vw-2rem)] ${zClass}`
  }

  const isDraggable = !isMinimized && !isMaximized

  return (
    <motion.div
      style={{ x }}
      drag={isDraggable ? 'x' : false}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onFocusCapture={() => dispatch(setActiveDraft(draftId))}
      onPointerDownCapture={() => dispatch(setActiveDraft(draftId))}
      className={cn(
        'bg-background pointer-events-auto flex flex-col border transition-all duration-300',
        !isMaximized && 'relative rounded-t-lg',
        getContainerClasses(),
        isMaximized && 'rounded-lg'
      )}
    >
      <div
        className={cn(
          'bg-primary text-primary-foreground flex h-12 shrink-0 items-center rounded-t-lg px-4 select-none',
          isDraggable && 'cursor-grab active:cursor-grabbing',
          isMinimized && 'cursor-pointer',
          isMaximized && 'rounded-t-lg'
        )}
        onPointerDown={
          isDraggable ? (event) => dragControls.start(event) : undefined
        }
        onClick={isMinimized ? handleRestore : undefined}
        style={{ touchAction: isDraggable ? 'none' : undefined }}
      >
        <div className="min-w-0 flex-1 truncate text-sm font-medium">
          {subject.trim() || t('new_message.string')}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isMinimized ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleRestore()
              }}
            >
              <Maximize2 className="h-4 w-4" />
              <span className="sr-only">{t('restore.string')}</span>
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                title={t('discard_draft.string')}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDiscardDraft()
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                onClick={handleMinimize}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">{t('minimize.string')}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                onClick={isMaximized ? handleRestore : handleMaximize}
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isMaximized ? t('restore.string') : t('maximize.string')}
                </span>
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">{t('close.string')}</span>
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-hidden">
            <div className="flex h-full flex-col">
              <ComposeHeader draftId={draftId} />
              <div
                className={cn(
                  'mt-4 flex flex-1 flex-col overflow-y-auto',
                  styles.compose_editor
                )}
              >
                <CustomEditor draftId={draftId} />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="rounded"
                size="sm"
                title={t('attachment.string')}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              {jitsiLinkEnabled && jitsiBaseUrl && (
                <Button
                  variant="outline"
                  className="rounded"
                  size="sm"
                  onClick={handleInsertJitsi}
                  title={t('jitsi.string')}
                >
                  <Video className="h-5 w-5" />
                </Button>
              )}
              <ButtonGroup className="z-9999">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="More Options"
                    >
                      <MoreVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-9999 w-40">
                    <DropdownMenuGroup>
                      <DropdownMenuCheckboxItem
                        checked={requestReadReceipt}
                        onCheckedChange={() =>
                          dispatch(toggleReadReceipt({ draftId }))
                        }
                      >
                        {t('return_receipt.string')}
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          {t('priority.string')}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup
                            value={selectedPriority}
                            onValueChange={(value) =>
                              dispatch(
                                updatePriority({
                                  draftId,
                                  priority:
                                    value as MailComposeDraft['priority'],
                                })
                              )
                            }
                          >
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_HIGHEST}
                            >
                              {t('highest.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value={MAIL_PRIORITY_HIGH}>
                              {t('high.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value={MAIL_PRIORITY_NORMAL}>
                              {t('normal.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value={MAIL_PRIORITY_LOW}>
                              {t('low.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value={MAIL_PRIORITY_LOWEST}>
                              {t('lowest.string')}
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </div>

            {/* ── Send / Schedule ─────────────────────────────────────────── */}
            <ButtonGroup>
              <Button
                variant="default"
                size="sm"
                onClick={handleSend}
                disabled={isSending}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? t('sending.string') : t('send.string')}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    aria-label="More Options"
                    disabled={isSending}
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-9999 w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      {t('schedule_sending.string')}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
          </div>
        </>
      )}
      <AlertDialog
        open={showNoRecipientAlert}
        onOpenChange={setShowNoRecipientAlert}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('no_recipient_alert.title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('no_recipient_alert.content.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoRecipientAlert(false)}>
              {t('no_recipient_alert.ok.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

export default FloatingCompose
