import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MoreHorizontal } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'

interface SidebarItemProps {
  name: string
  id: string
  isDefault?: boolean
  disableActions?: boolean
  editAction?: boolean
  importAction?: boolean
  sharingAction?: boolean
  linkAction?: boolean
  exportAction?: boolean
  downloadAction?: boolean
  icon?: IconName
  isActive?: boolean
  onClick: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isActive,
  ...props
}) => {
  const [type, setType] = React.useState('')
  const t = useTranslations('Mails')
  const isMobile = useIsMobile()
  return (
    <>
      <SidebarMenuButton
        className="h-10 align-middle group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none [&[data-state=open]>svg:first-child]:rotate-90"
        tooltip={name}
        isActive={isActive}
        {...props}
      >
        {icon && (
          <DynamicIcon className="h-5 w-5 transition-transform" name={icon} />
        )}
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {name}
        </span>
      </SidebarMenuButton>
      {!disableActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal />
              <span className="sr-only">Options</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align={isMobile ? 'end' : 'start'}
          >
            <DropdownMenuItem onClick={() => setType('edit')}>
              <span>{t('options.rename.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setType('delete')}>
              <span>{t('options.mark_as_read.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setType('link')}>
              <span>{t('options.new_subfolder.string')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setType('sharing')}>
              <span>{t('options.sharing.string')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}

export default SidebarItem
