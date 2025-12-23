import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'

const ComposeOpener: React.FC = () => {
  const t = useTranslations('COMPOSE')
  const isMobile = useIsMobile()
  const { setOpenMobile } = useSidebar()
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const pathname = usePathname()

  const handleOpenCompose = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
    const params = new URLSearchParams(searchParams.toString())
    params.set('compose', 'true')
    const query = params.toString()
    push(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <>
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
    </>
  )
}

export default ComposeOpener
