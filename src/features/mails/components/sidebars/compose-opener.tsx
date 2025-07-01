import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useRouter } from '@/lib/i18n/navigation'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { ModalCompose } from '../compose/modal-compose'

const ComposeOpener: React.FC = () => {
  const t = useTranslations('Mails')
  const searchParams = useSearchParams()
  const isOpen = !!searchParams.get('compose')
  const { push } = useRouter()

  return (
    <>
      <SidebarMenuButton
        onClick={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.set('compose', 'true')
          const query = params.toString()
          push(query ? `?${query}` : '')
        }}
        className="h-10 justify-center rounded-lg border-2 text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
      >
        <span className="sr-only">{t('new_message.string')}</span>
        <Pencil className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {t('new_message.string')}
        </span>
      </SidebarMenuButton>
      <ModalCompose
        open={isOpen}
        onClose={() => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete('compose')
          const query = params.toString()
          push(query ? `?${query}` : '')
        }}
      />
    </>
  )
}

export default ComposeOpener
