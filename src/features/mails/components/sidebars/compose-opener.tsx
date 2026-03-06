import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'sonner'
import {
  createDraft,
  MAX_OPEN_DRAFTS,
  selectCanOpenNewDraft,
} from '../../store'

const ComposeOpener: React.FC = () => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const dispatch = useAppDispatch()
  const canOpen = useAppSelector(selectCanOpenNewDraft)

  const handleOpenCompose = () => {
    if (!canOpen) {
      toast.error(t('max_windows_error.string', { max: MAX_OPEN_DRAFTS }))
      return
    }

    if (isMobile) {
      setOpenMobile(false)
    }

    dispatch(createDraft({ id: crypto.randomUUID() }))
  }

  return (
      <SidebarMenuButton
        onClick={handleOpenCompose}
        className="h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
      >
        <span className="sr-only">{t('new_message.string')}</span>
        <Pencil className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {t('new_message.string')}
        </span>
      </SidebarMenuButton>
  )
}

export default ComposeOpener
