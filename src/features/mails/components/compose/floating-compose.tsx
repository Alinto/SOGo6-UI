'use client'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { motion, useDragControls, useMotionValue } from 'framer-motion'
import { Maximize2, Minimize2, Minus, Save, Send, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { closeDraft, setActiveDraft } from '../../store'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import styles from './compose.module.css'

interface FloatingComposeProps {
  draftId: string
}

export const FloatingCompose: React.FC<FloatingComposeProps> = ({ draftId }) => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const dispatch = useAppDispatch()
  const draft = useAppSelector((state) => state.mailCompose.drafts[draftId])
  const subject = useAppSelector(
    (state) => state.mailCompose.drafts[draftId]?.subject ?? ''
  )
  const dragControls = useDragControls()
  const x = useMotionValue(0)
  const activeDraftId = useAppSelector((state) => state.mailCompose.activeDraftId)
  const isActive = activeDraftId === draftId

  // Maximize on mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsMaximized(true)
    } else {
      setIsMaximized(false)
    }
  }, [isMobile])

  const handleClose = () => {
    dispatch(closeDraft({ draftId }))
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
          'bg-primary text-primary-foreground flex h-12 shrink-0 items-center justify-between rounded-t-lg px-4 select-none',
          isDraggable && 'cursor-grab active:cursor-grabbing',
          isMinimized && 'cursor-pointer',
          isMinimized && 'rounded-t-lg',
          isMaximized && 'rounded-t-lg'
        )}
        onPointerDown={
          isDraggable ? (event) => dragControls.start(event) : undefined
        }
        onClick={isMinimized ? handleRestore : undefined}
        style={{ touchAction: isDraggable ? 'none' : undefined }}
      >
        <span className="truncate max-w-[180px] text-sm font-medium">
          {subject.trim() || t('new_message.string')}
        </span>
        <div className="flex items-center gap-1">
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
              <ComposeHeader onClose={handleClose} />
              <div
                className={cn(
                  'mt-4 flex flex-1 flex-col overflow-y-auto',
                  styles.compose_editor
                )}
              >
                <CustomEditor />
              </div>
            </div>
          </div>

          <div className="bg-muted/50 flex items-center justify-between border-t px-4 py-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              {t('save_draft.string')}
            </Button>
            <Button size="sm">
              <Send className="mr-2 h-4 w-4" />
              {t('send.string')}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}

export default FloatingCompose