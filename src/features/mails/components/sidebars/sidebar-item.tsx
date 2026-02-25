'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton } from '@/components/ui/sidebar'
import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { MoreVertical } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import type { IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'

interface SidebarItemProps {
  name: string
  icon?: IconName
  isActive?: boolean
  isDefault?: boolean
  disableActions?: boolean
  handleClick: () => void
  onClick?: React.MouseEventHandler<HTMLDivElement>
  collapsible?: boolean
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isActive,
  isDefault,
  handleClick,
  onClick,
}) => {
  const [type, setType] = React.useState<string | null>(null)
  const { mailPurgeAllow } = useProfile()
  const t = useTranslations('MAILS_COMMONS')
  const isMobile = useIsMobile()

  return (
    <>
      <SidebarMenuButton
        className={`h-10 align-middle ${
          !isDefault ? 'group-data-[collapsible=icon]:hidden' : ''
        } group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none`}
        tooltip={name}
        isActive={isActive}
        onClick={handleClick}
        title={name}
      >
        {icon && (
          <div
            className={`z-50 mr-2 h-5 w-5 p-0 group-data-[collapsible=icon]:visible group-data-[collapsible=icon]:pl-1 ${
              onClick ? '[&[data-state=open]>svg:first-child]:rotate-90' : ''
            }`}
            data-collapsible="icon"
            data-state="open"
            onClick={(e) => {
              e.stopPropagation()
              if (onClick) {
                onClick(e)
              } else {
                handleClick()
              }
            }}
          >
            <DynamicIcon
              className="h-5 w-5 transition-transform data-[state=open]:rotate-90"
              name={icon}
            />
          </div>
        )}
        <span className="w-9/12 truncate group-data-[collapsible=icon]:hidden">
          {name}
        </span>
      </SidebarMenuButton>

      {!disableActions && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction
                dataSidebar={`menu-button-${name}`}
                showOnHover
              >
                <MoreVertical />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'end' : 'start'}
            >
              <DropdownMenuItem onClick={() => setType('rename')}>
                <span>{t('folders.actions.rename.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setType('mark_as_read')}>
                <span>{t('folders.actions.mark_as_read.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setType('new_subfolder')}>
                <span>{t('folders.actions.new_subfolder.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setType('sharing')}>
                <span>{t('folders.actions.sharing.string')}</span>
              </DropdownMenuItem>
              {mailPurgeAllow && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setType('purge')}>
                    <span>{t('folders.actions.purge.string')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* TODO: connect a Dialog to `type` for each action */}
          {/* type === 'rename' && <RenameDialog ... /> */}
          {/* type === 'purge' && <PurgeDialog ... /> */}
        </>
      )}
    </>
  )
}

export default SidebarItem
