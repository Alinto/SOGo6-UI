'use client'

import { useComposeAttachmentUpload } from '@/features/mails/hooks/use-compose-attachment-upload'
import { useComposeDraftPersistence } from '@/features/mails/hooks/use-compose-draft-persistence'
import { useComposeFloatingWindowState } from '@/features/mails/hooks/use-compose-floating-window-state'
import { useComposeSend } from '@/features/mails/hooks/use-compose-send'
import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Paperclip } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { setActiveDraft } from '../../store'
import { selectDraftData } from '../../store/mail-compose-selectors'
import { setPendingInsert } from '../../store/mail-compose-slice'
import { resolveComposeAccountId } from '../../utils/resolve-compose-account-id'
import ComposeAttachmentList from './compose-attachment-list'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import ComposeSendAlerts from './compose-send-alerts'
import ComposeToolbar from './compose-toolbar'
import ComposeWindowHeader from './compose-window-header'
import styles from './compose.module.css'

interface FloatingComposeProps {
  draftId: string
}

export const FloatingCompose: React.FC<FloatingComposeProps> = ({
  draftId,
}) => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
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
      resolveComposeAccountId(
        selectedIdentity?.mail,
        mainAccount,
        externalAccounts
      ),
    [selectedIdentity?.mail, mainAccount, externalAccounts]
  )

  const SOGO_D_MAIL_DRAFT_AUTOSAVE = uiSettings?.SOGO_D_MAIL_DRAFT_AUTOSAVE

  const {
    fileInputRef,
    isDragOver,
    isUploading,
    handleAttachmentClick,
    handleFileChange,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useComposeAttachmentUpload({ draftId, accountId, mailKey })

  const {
    isMinimized,
    isMaximized,
    dragControls,
    x,
    handleMinimize,
    handleRestore,
    handleMaximize,
    containerClasses,
    showMinimized,
    isDraggable,
  } = useComposeFloatingWindowState({ isMobile, isActive })

  const mailFields = {
    selectedIdentity,
    toRecipients,
    ccRecipients,
    bccRecipients,
    subject,
    body,
    requestReadReceipt,
    selectedPriority,
    isPlainText,
  }

  const {
    isSending,
    handleSend,
    handleConfirmSendAnyway,
    showNoRecipientAlert,
    setShowNoRecipientAlert,
    emptyContentAlert,
    setEmptyContentAlert,
  } = useComposeSend({ draftId, accountId, mailKey, ...mailFields })

  const { handleClose, handleDiscardDraft } = useComposeDraftPersistence({
    draftId,
    accountId,
    mailKey,
    isActive,
    isMinimized,
    isDirty,
    hasDraft: !!draft,
    isSending,
    isUploading,
    autosaveIntervalMs: SOGO_D_MAIL_DRAFT_AUTOSAVE
      ? SOGO_D_MAIL_DRAFT_AUTOSAVE * 1000
      : 5000,
    ...mailFields,
  })

  const handleInsertJitsi = () => {
    const meetId = Math.random().toString(36).substring(2, 10)
    const link = `${jitsiBaseUrl}/${meetId}`
    dispatch(setPendingInsert(`<a href="${link}">${link}</a>`))
  }

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
        containerClasses,
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

      <ComposeWindowHeader
        subject={subject}
        isMobile={isMobile}
        isDraggable={isDraggable}
        showMinimized={showMinimized}
        isMaximized={isMaximized}
        isSending={isSending}
        isUploading={isUploading}
        dragControls={dragControls}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        onRestore={handleRestore}
        onDiscardDraft={() => void handleDiscardDraft()}
        onClose={handleClose}
      />

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
          <ComposeAttachmentList
            draftId={draftId}
            accountId={accountId}
            mailKey={mailKey}
            attachments={attachments}
          />

          {/* ── Toolbar ─────────────────────────────────────────────────── */}
          <ComposeToolbar
            draftId={draftId}
            fileInputRef={fileInputRef}
            isUploading={isUploading}
            onAttachmentClick={handleAttachmentClick}
            onFileChange={handleFileChange}
            jitsiEnabled={Boolean(jitsiLinkEnabled && jitsiBaseUrl)}
            onInsertJitsi={handleInsertJitsi}
            requestReadReceipt={requestReadReceipt}
            selectedPriority={selectedPriority}
            isSending={isSending}
            onSend={() => void handleSend()}
          />
        </>
      )}

      <ComposeSendAlerts
        showNoRecipientAlert={showNoRecipientAlert}
        onNoRecipientAlertOpenChange={setShowNoRecipientAlert}
        emptyContentAlert={emptyContentAlert}
        onEmptyContentAlertOpenChange={(open) =>
          !open && setEmptyContentAlert(null)
        }
        onConfirmSendAnyway={() => void handleConfirmSendAnyway()}
      />
    </motion.div>
  )
}

export default FloatingCompose
