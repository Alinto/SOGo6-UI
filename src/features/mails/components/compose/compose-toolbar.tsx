'use client'

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
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import {
  MoreHorizontalIcon,
  MoreVerticalIcon,
  Paperclip,
  Send,
  Video,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_LOW,
  MAIL_PRIORITY_LOWEST,
  MAIL_PRIORITY_NORMAL,
  MailComposeDraft,
  toggleReadReceipt,
  updatePriority,
} from '../../store/mail-compose-slice'

interface ComposeToolbarProps {
  draftId: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  isUploading: boolean
  onAttachmentClick: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  jitsiEnabled: boolean
  onInsertJitsi: () => void
  requestReadReceipt: boolean
  selectedPriority: MailComposeDraft['priority']
  isSending: boolean
  onSend: () => void
}

export function ComposeToolbar({
  draftId,
  fileInputRef,
  isUploading,
  onAttachmentClick,
  onFileChange,
  jitsiEnabled,
  onInsertJitsi,
  requestReadReceipt,
  selectedPriority,
  isSending,
  onSend,
}: ComposeToolbarProps) {
  const t = useTranslations('COMPOSE')
  const dispatch = useAppDispatch()

  return (
    <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onFileChange}
        />

        <Button
          variant="outline"
          className="rounded"
          size="sm"
          title={t('attachment.string')}
          onClick={onAttachmentClick}
        >
          <Paperclip className={cn('h-5 w-5', isUploading && 'animate-pulse')} />
        </Button>

        {jitsiEnabled && (
          <Button
            variant="outline"
            className="rounded"
            size="sm"
            onClick={onInsertJitsi}
            title={t('jitsi.string')}
          >
            <Video className="h-5 w-5" />
          </Button>
        )}

        <ButtonGroup className="z-9999">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="More Options">
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
          onClick={onSend}
          disabled={isSending || isUploading}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSending ? t('sending.string') : t('send.string')}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              aria-label="More Options"
              disabled={isSending || isUploading}
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-9999 w-40">
            <DropdownMenuGroup>
              <DropdownMenuItem>{t('schedule_sending.string')}</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}

export default ComposeToolbar
