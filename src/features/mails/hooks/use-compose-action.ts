'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Pencil, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback } from 'react'
import { toast } from 'sonner'
import {
  createDraft,
  MAX_OPEN_DRAFTS,
  selectCanOpenNewDraft,
} from '../store'

function createDraftId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function useComposeAction(options?: { closeMobileSidebar?: boolean }) {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const canOpen = useAppSelector(selectCanOpenNewDraft)
  const closeMobileSidebar = options?.closeMobileSidebar ?? true

  const onClick = useCallback(() => {
    if (!canOpen) {
      toast.error(t('max_windows_error.string', { max: MAX_OPEN_DRAFTS }))
      return
    }

    if (closeMobileSidebar && isMobile) {
      setOpenMobile(false)
    }

    dispatch(createDraft({ draftId: createDraftId() }))
  }, [canOpen, closeMobileSidebar, dispatch, isMobile, setOpenMobile, t])

  return {
    onClick,
    label: t('new_message.string'),
    icon: Pencil as LucideIcon,
  }
}
