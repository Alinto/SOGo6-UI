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
import { formatFileSize } from '@/features/mails/components/utils'
import { useProfile } from '@/features/user-profile'
import { useInterval } from '@/hooks/use-interval'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { createClientId } from '@/lib/utils/create-client-id'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import {
  Download,
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
import React from 'react'
import { closeDraft, setActiveDraft } from '../../store'
import {
  useDeleteAttachmentMutation,
  useDeleteMailMutation,
  useLazyDownloadAttachmentQuery,
  useSaveDraftMutation,
  useSendMailMutation,
  useUploadAttachmentMutation,
} from '../../store/mail-api'
import { selectDraftData } from '../../store/mail-compose-selectors'
import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_LOW,
  MAIL_PRIORITY_LOWEST,
  MAIL_PRIORITY_NORMAL,
  MailComposeAttachment,
  MailComposeDraft,
  MailComposeRecipient,
  addAttachment,
  markDraftSaved,
  removeAttachment,
  renameAttachment,
  setPendingInsert,
  toggleReadReceipt,
  updateAttachmentProgress,
  updateMailKey,
  updatePriority,
} from '../../store/mail-compose-slice'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import styles from './compose.module.css'

interface FloatingComposeProps {
  draftId: string
}

function resolveAccountId(
  identityMail: string | undefined,
  mainAccount: ReturnType<typeof useProfile>['mainAccount'],
  externalAccounts: ReturnType<typeof useProfile>['externalAccounts']
): string {
  if (!identityMail) return '0'

  const inMain = mainAccount?.identities?.some((id) => id.mail === identityMail)
  if (inMain && mainAccount?.id) return String(mainAccount.id)

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

  const {
    draft,
    mailKey,
    subject,
    selectedPriority,
    requestReadReceipt,
    isPlainText,
    selectedIdentity,
    toRecipients,
    ccRecipients,
    bccRecipients,
    body,
    isDirty,
    attachments,
  } = useAppSelector(selectDraftData(draftId))

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

  const accountId = React.useMemo(
    () =>
      resolveAccountId(selectedIdentity?.mail, mainAccount, externalAccounts),
    [selectedIdentity?.mail, mainAccount, externalAccounts]
  )

  const SOGO_D_MAIL_DRAFT_AUTOSAVE = uiSettings?.SOGO_D_MAIL_DRAFT_AUTOSAVE

  const dragControls = useDragControls()
  const x = useMotionValue(0)

  const [sendMail, { isLoading: isSending }] = useSendMailMutation()
  const [saveDraft, { isLoading: isSavingDraft }] = useSaveDraftMutation()
  const [deleteMail] = useDeleteMailMutation()

  const [uploadAttachment, { isLoading: isUploading }] =
    useUploadAttachmentMutation()
  const [deleteAttachment] = useDeleteAttachmentMutation()
  const [triggerDownloadAttachment] = useLazyDownloadAttachmentQuery()

  const [showNoRecipientAlert, setShowNoRecipientAlert] = React.useState(false)
  const [isDragOver, setIsDragOver] = React.useState(false)
  const dragCounterRef = React.useRef(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const resetDragState = () => {
      dragCounterRef.current = 0
      setIsDragOver(false)
    }
    // capture phase: fires before CKEditor's stopPropagation on drop
    document.addEventListener('drop', resetDragState, true)
    // dragend: fires when an internal drag ends anywhere
    document.addEventListener('dragend', resetDragState)
    return () => {
      document.removeEventListener('drop', resetDragState, true)
      document.removeEventListener('dragend', resetDragState)
    }
  }, [])

  React.useEffect(() => {
    if (isMobile) {
      setIsMaximized(true)
      setIsMinimized(false)
    } else {
      setIsMaximized(false)
    }
  }, [isMobile])

  const handleClose = () => {
    //if no save needed
    if (!mailKey && !isDirty) {
      dispatch(closeDraft({ draftId }))
    } else {
      //else save then close
      handleSaveDraft(true, true, true)
    }
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

  const handleSaveDraft = async (
    displayNotificationOnSuccess: boolean,
    displayNotificationOnError: boolean,
    closeOnSave: boolean
  ): Promise<void> => {
    const result = await saveDraft({
      accountId,
      mailKey,
      mail: {
        from: selectedIdentity?.mail,
        to: toRecipients.map((r: MailComposeRecipient) => r.email),
        cc: ccRecipients.map((r: MailComposeRecipient) => r.email),
        bcc: bccRecipients.map((r: MailComposeRecipient) => r.email),
        subject,
        body,
        return_receipt: requestReadReceipt ? true : null,
        priority: selectedPriority,
        is_html: !isPlainText,
        reply_to: selectedIdentity?.replyTo || null,
      },
      close: closeOnSave,
      displayNotificationOnError,
      displayNotificationOnSuccess,
    })

    if (!('error' in result)) {
      dispatch(markDraftSaved({ draftId }))

      if ('data' in result && result?.data?.data?.key) {
        dispatch(
          updateMailKey({
            draftId,
            mailKey: result.data.data.key,
          })
        )
      }

      if (closeOnSave) {
        dispatch(closeDraft({ draftId }))
      }
    }
  }

  useInterval(
    () => {
      if (
        isActive &&
        draft &&
        isDirty &&
        !isSavingDraft &&
        !isSending &&
        !isUploading
      ) {
        handleSaveDraft(false, false, false)
      }
    },
    SOGO_D_MAIL_DRAFT_AUTOSAVE ? SOGO_D_MAIL_DRAFT_AUTOSAVE * 1000 : 5000,
    !isMinimized
  )

  const handleDiscardDraft = async () => {
    if (mailKey != null) {
      await deleteMail({ accountId, mailKey })
    }

    dispatch(closeDraft({ draftId }))
  }

  const handleSend = async () => {
    if (!selectedIdentity?.mail) return

    if (toRecipients.length === 0) {
      setShowNoRecipientAlert(true)
      return
    }

    const result = await sendMail({
      accountId,
      mailKey,
      mail: {
        from: selectedIdentity.mail,
        to: toRecipients.map((r: MailComposeRecipient) => r.email),
        cc: ccRecipients.map((r: MailComposeRecipient) => r.email),
        bcc: bccRecipients.map((r: MailComposeRecipient) => r.email),
        subject,
        body,
        return_receipt: requestReadReceipt ? true : null,
        priority: selectedPriority,
        is_html: !isPlainText,
        reply_to: selectedIdentity?.replyTo || null,
      },
    })

    if (!('error' in result)) {
      dispatch(closeDraft({ draftId }))
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const processFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const tempId = createClientId()

      dispatch(
        addAttachment({
          draftId,
          attachment: {
            draftId: tempId,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadStatus: 'uploading',
            uploadProgress: 0,
          },
        })
      )

      try {
        const result = await uploadAttachment({
          accountId,
          mailKey,
          file,
        })
        if (!('error' in result) && result.data?.data) {
          const serverFilename = result.data.data.filename
          const serverMailKey = result.data.data.key

          dispatch(
            updateAttachmentProgress({
              draftId,
              attachmentId: tempId,
              progress: 100,
              status: 'completed',
            })
          )

          if (serverFilename) {
            dispatch(
              renameAttachment({
                draftId,
                attachmentId: tempId,
                name: serverFilename,
              })
            )
          }
          if (serverMailKey) {
            dispatch(updateMailKey({ draftId, mailKey: serverMailKey }))
          }
        } else {
          dispatch(
            updateAttachmentProgress({
              draftId,
              attachmentId: tempId,
              progress: 0,
              status: 'error',
            })
          )
        }
      } catch {
        dispatch(
          updateAttachmentProgress({
            draftId,
            attachmentId: tempId,
            progress: 0,
            status: 'error',
          })
        )
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    await processFiles(files)
    e.target.value = ''
  }

  const isFileDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes('Files')

  const handleDragEnter = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current++
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    if (!isFileDrag(e)) return
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (!files || files.length === 0) return
    await processFiles(files)
  }

  const handleDeleteAttachment = async (attachment: MailComposeAttachment) => {
    // If not yet uploaded or no mailKey, just remove from store
    if (attachment.uploadStatus !== 'completed' || mailKey == null) {
      dispatch(removeAttachment({ draftId, attachmentId: attachment.draftId }))
      return
    }
    const result = await deleteAttachment({
      accountId,
      mailKey,
      filename: attachment.name,
    })

    if (!('error' in result)) {
      dispatch(removeAttachment({ draftId, attachmentId: attachment.draftId }))
    }
  }

  const handleDownloadAttachment = async (
    attachment: MailComposeAttachment
  ) => {
    if (attachment.uploadStatus !== 'completed' || mailKey == null) return

    try {
      const blob = await triggerDownloadAttachment({
        accountId,
        mailKey,
        filename: attachment.name,
      }).unwrap()

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download attachment:', error)
    }
  }

  const getContainerClasses = React.useMemo(() => {
    const zClass = isActive
      ? 'z-50 shadow-2xl'
      : 'z-40 shadow-md opacity-95 hover:opacity-100'
    if (isMobile) {
      return `fixed inset-0 h-full w-full max-w-full rounded-none border-0 ${zClass}`
    }
    if (isMinimized) return `h-12 w-80 ${zClass}`
    if (isMaximized) {
      return `fixed inset-0 !m-auto h-[calc(100vh-2rem)] w-[calc(100vw-8rem)] max-w-[calc(100vw-8rem)] rounded-lg ${zClass}`
    }
    return `h-[550px] w-[540px] max-w-[calc(100vw-2rem)] ${zClass}`
  }, [isActive, isMinimized, isMaximized, isMobile])

  const showMinimized = isMinimized && !isMobile
  const isDraggable = !isMobile && !isMinimized && !isMaximized

  if (!draft) return null

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
        'bg-background pointer-events-auto relative flex flex-col border transition-all duration-300',
        !isMobile && !isMaximized && 'rounded-t-lg',
        getContainerClasses,
        isMaximized && !isMobile && 'rounded-lg'
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={(e) => void handleDrop(e)}
    >
      {isDragOver && !showMinimized && (
        <div className="border-primary bg-primary/10 pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-primary flex flex-col items-center gap-2">
            <Paperclip className="h-8 w-8" />
            <span className="text-sm font-medium">
              {t('drop_files.string')}
            </span>
          </div>
        </div>
      )}
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'bg-primary text-primary-foreground flex h-12 shrink-0 items-center rounded-t-lg px-4 select-none',
          isDraggable && 'cursor-grab active:cursor-grabbing',
          showMinimized && 'cursor-pointer',
          isMaximized && (isMobile ? 'rounded-none' : 'rounded-t-lg')
        )}
        onPointerDown={
          isDraggable ? (event) => dragControls.start(event) : undefined
        }
        onClick={showMinimized ? handleRestore : undefined}
        style={{ touchAction: isDraggable ? 'none' : undefined }}
      >
        <div className="min-w-0 flex-1 truncate text-sm font-medium">
          {subject.trim() || t('new_message.string')}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {showMinimized ? (
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
                  void handleDiscardDraft()
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                  onClick={handleMinimize}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">{t('minimize.string')}</span>
                </Button>
              )}
              {!isMobile && (
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
              )}
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            disabled={isSending || isUploading}
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

      {!showMinimized && (
        <>
          {/* ── Body ───────────────────────────────────────────────────── */}
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

          {/* ── Attachment list ─────────────────────────────────────────── */}
          {attachments.length > 0 && (
            <div className="flex flex-col gap-1 border-t px-4 py-2">
              {attachments.map((att: MailComposeAttachment) => (
                <div
                  key={att.draftId}
                  className={cn(
                    'bg-muted flex flex-col rounded px-2 py-1.5 text-xs',
                    att.uploadStatus === 'error' && 'border-destructive border'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip
                        className={cn(
                          'h-3 w-3 shrink-0',
                          att.uploadStatus === 'uploading' && 'animate-pulse'
                        )}
                      />
                      <span className="truncate">{att.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {formatFileSize(att.size)}
                      </span>
                      {att.uploadStatus === 'error' && (
                        <span className="text-destructive shrink-0">
                          {t('attachment_error.string')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {att.uploadStatus === 'completed' && (
                        <button
                          className="hover:text-primary ml-2 shrink-0"
                          onClick={() => void handleDownloadAttachment(att)}
                          title={t('attachment.title.string')}
                        >
                          <Download className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        className="hover:text-destructive shrink-0"
                        onClick={() => void handleDeleteAttachment(att)}
                        disabled={att.uploadStatus === 'uploading'}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {att.uploadStatus === 'uploading' && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="bg-muted-foreground/20 h-1 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${att.uploadProgress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-7 shrink-0 text-right">
                        {att.uploadProgress ?? 0}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <Button
                variant="outline"
                className="rounded"
                size="sm"
                title={t('attachment.string')}
                onClick={handleAttachmentClick}
              >
                <Paperclip
                  className={cn('h-5 w-5', isUploading && 'animate-pulse')}
                />
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
                            value={selectedPriority.toString()}
                            onValueChange={(value) =>
                              dispatch(
                                updatePriority({
                                  draftId,
                                  priority: Number(
                                    value
                                  ) as MailComposeDraft['priority'],
                                })
                              )
                            }
                          >
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_HIGHEST.toString()}
                            >
                              {t('highest.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_HIGH.toString()}
                            >
                              {t('high.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_NORMAL.toString()}
                            >
                              {t('normal.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_LOW.toString()}
                            >
                              {t('low.string')}
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem
                              value={MAIL_PRIORITY_LOWEST.toString()}
                            >
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

            {/* ── Send / Schedule ──────────────────────────────────────── */}
            <ButtonGroup>
              <Button
                variant="default"
                size="sm"
                onClick={() => void handleSend()}
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
        <AlertDialogContent className="z-[9999]">
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
