'use client'

import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import {
  ExternalLink,
  Maximize2,
  Minimize2,
  Minus,
  Save,
  Send,
  X,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { closeCompose, openCompose, selectIsComposeOpen } from '../../store'
import CustomEditor from './compose'
import ComposeHeader from './compose-header'
import styles from './compose.module.css'

export const FloatingCompose: React.FC = () => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const locale = useLocale()
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)

  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const isComposeOpen = useAppSelector(selectIsComposeOpen)
  const composeParam = searchParams.get('compose')
  const { push } = useRouter()
  const pathname = usePathname()

  // Sync URL param with Redux state
  React.useEffect(() => {
    if (composeParam === 'true' && !isComposeOpen) {
      dispatch(openCompose())
    } else if (composeParam !== 'true' && isComposeOpen) {
      dispatch(closeCompose())
    }
  }, [composeParam, isComposeOpen, dispatch])

  // Maximize on mobile
  React.useEffect(() => {
    if (isMobile) {
      setIsMaximized(true)
    } else {
      setIsMaximized(false)
    }
  }, [isMobile])

  const handleClose = () => {
    dispatch(closeCompose())
    const params = new URLSearchParams(searchParams.toString())
    params.delete('compose')
    const query = params.toString()
    push(query ? `${pathname}?${query}` : pathname)
  }

  const handleOpenInNewPage = () => {
    dispatch(closeCompose())
    const params = new URLSearchParams(searchParams.toString())
    params.delete('compose')
    const query = params.toString()
    push(query ? `${pathname}?${query}` : pathname)
    // Extract locale from pathname (assumes /:locale/...)
    const composePath = locale ? `/${locale}/compose` : '/compose'
    window.open(composePath, '_blank')
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsMaximized(false)
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsMaximized(false)
  }

  const handleMaximize = () => {
    setIsMaximized(true)
    setIsMinimized(false)
  }

  if (!isComposeOpen) return null

  const getContainerClasses = () => {
    if (isMinimized) {
      return 'right-14 bottom-0 h-12 w-80'
    }
    if (isMaximized) {
      return 'inset-4 h-auto w-auto'
    }
    return 'right-14 bottom-0 h-[600px] w-[700px] max-w-[calc(100vw-2rem)]'
  }

  return (
    <div
      className={cn(
        'bg-background fixed z-50 flex flex-col rounded-t-lg border shadow-2xl transition-all duration-300',
        getContainerClasses(),
        isMaximized && 'rounded-lg'
      )}
    >
      {/* Title bar - always visible */}
      <div
        className={cn(
          'bg-primary text-primary-foreground flex h-12 shrink-0 cursor-pointer items-center justify-between rounded-t-lg px-4',
          isMinimized && 'rounded-t-lg',
          isMaximized && 'rounded-t-lg'
        )}
        onClick={isMinimized ? handleRestore : undefined}
      >
        <span className="text-sm font-medium">{t('new_message.string')}</span>
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
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                onClick={handleOpenInNewPage}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">{t('open_in_new_page.string')}</span>
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

      {/* Content - hidden when minimized */}
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

          {/* Footer */}
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
    </div>
  )
}

export default FloatingCompose
