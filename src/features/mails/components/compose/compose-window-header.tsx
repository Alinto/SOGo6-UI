'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DragControls } from 'framer-motion'
import { Maximize2, Minimize2, Minus, Trash, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ComposeWindowHeaderProps {
  subject: string
  isMobile: boolean
  isDraggable: boolean
  showMinimized: boolean
  isMaximized: boolean
  isSending: boolean
  isUploading: boolean
  dragControls: DragControls
  onMinimize: () => void
  onMaximize: () => void
  onRestore: () => void
  onDiscardDraft: () => void
  onClose: () => void
}

export function ComposeWindowHeader({
  subject,
  isMobile,
  isDraggable,
  showMinimized,
  isMaximized,
  isSending,
  isUploading,
  dragControls,
  onMinimize,
  onMaximize,
  onRestore,
  onDiscardDraft,
  onClose,
}: ComposeWindowHeaderProps) {
  const t = useTranslations('COMPOSE')

  return (
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
      onClick={showMinimized ? onRestore : undefined}
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
              onRestore()
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
                onDiscardDraft()
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                onClick={onMinimize}
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
                onClick={isMaximized ? onRestore : onMaximize}
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
            onClose()
          }}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">{t('close.string')}</span>
        </Button>
      </div>
    </div>
  )
}

export default ComposeWindowHeader
