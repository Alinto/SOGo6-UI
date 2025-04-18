import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { MoreVertical } from 'lucide-react'
import { DynamicIcon, IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'

interface SidebarItemProps {
  name: string
  id: string
  isDefault?: boolean
  disableActions?: boolean
  propertiesAction?: boolean
  importAction?: boolean
  sharingAction?: boolean
  linkAction?: boolean
  exportAction?: boolean
  downloadAction?: boolean
  icon?: IconName
  onClick: () => void
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isDefault,
  id,
  propertiesAction = true,
  importAction = true,
  sharingAction = true,
  linkAction = true,
  exportAction = true,
  downloadAction = true,
}) => {
  const t = useTranslations('Address_Books')
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        className="h-10"
        onClick={() => console.log(`push to /address_books/${id}`)}
        title={name}
      >
        {icon && <DynamicIcon name={icon} className="mr-2" />}
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
      {!disableActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction className="h-7">
              <MoreVertical />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            {propertiesAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.properties.string')}</span>
              </DropdownMenuItem>
            )}
            {!isDefault && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.delete.string')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {linkAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.link.string')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {importAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.import.string')}</span>
              </DropdownMenuItem>
            )}
            {exportAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.export.string')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {sharingAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.sharing.string')}</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {downloadAction && (
              <DropdownMenuItem>
                <span>{t('sidebar.options.ios_download.string')}</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  )
}

export default SidebarItem
