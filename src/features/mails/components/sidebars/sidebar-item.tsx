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
import { ChevronRight, MoreVertical } from 'lucide-react'
import type { IconName } from 'lucide-react/dynamic'
import { DynamicIcon } from 'lucide-react/dynamic'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React from 'react'
import { CreateFolderDialog } from './create-folder-dialog'
import { DeleteFolderDialog } from './delete-folder-dialog'
import { ExpungeFolderDialog } from './expunge-folder-dialog'
import { PurgeFolderDialog } from './purge-folder-dialog'
import { ShareFolderDialog } from './share-folder-dialog'

interface SidebarItemProps {
  name: string
  icon?: IconName
  isActive?: boolean
  isDefault?: boolean
  disableActions?: boolean
  handleClick: () => void
  onClick?: React.MouseEventHandler<HTMLDivElement>
  collapsible?: boolean
  folderPath?: string
  folderName?: string
  accountId?: string
  hasSubfolders?: boolean
  isOpen?: boolean
}

type FolderActionType =
  | 'rename'
  | 'mark_as_read'
  | 'new_subfolder'
  | 'sharing'
  | 'purge'
  | 'expunge'
  | 'delete'
  | null

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isActive,
  isDefault,
  handleClick,
  onClick,
  folderPath,
  folderName,
  accountId,
  hasSubfolders,
  isOpen,
}) => {
  const [type, setType] = React.useState<FolderActionType>(null)
  const { mailPurgeAllow, folderSharingDisabled } = useProfile()
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
            className="z-50 mr-2 h-5 w-5 shrink-0 p-0 group-data-[collapsible=icon]:visible group-data-[collapsible=icon]:pl-1"
            data-collapsible="icon"
            onClick={(e) => {
              e.stopPropagation()
              if (onClick) {
                onClick(e)
              } else {
                handleClick()
              }
            }}
          >
            <DynamicIcon className="h-5 w-5" name={icon} />
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-1 group-data-[collapsible=icon]:hidden">
          <span className="min-w-0 shrink truncate">{name}</span>
          {hasSubfolders ? (
            <ChevronRight
              aria-hidden
              strokeWidth={2.5}
              className={cn(
                'h-4 w-4 shrink-0 text-sidebar-foreground/85 transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          ) : null}
        </div>
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
              {!folderSharingDisabled && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setType('sharing')}>
                    <span>{t('folders.actions.sharing.string')}</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              {mailPurgeAllow && (
                <DropdownMenuItem onClick={() => setType('purge')}>
                  <span>{t('folders.actions.purge.string')}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setType('expunge')}>
                <span>{t('folders.actions.expunge.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setType('delete')}
                className="text-destructive focus:text-destructive"
              >
                <span>{t('folders.actions.delete.string')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {type === 'purge' && folderPath && folderName && accountId && (
            <PurgeFolderDialog
              open={true}
              onOpenChange={(open) => !open && setType(null)}
              accountId={accountId}
              folderPath={folderPath}
              folderName={folderName}
              hasSubfolders={hasSubfolders ?? false}
            />
          )}
          {type === 'expunge' && folderPath && folderName && accountId && (
            <ExpungeFolderDialog
              open={true}
              onOpenChange={(open) => !open && setType(null)}
              accountId={accountId}
              folderPath={folderPath}
              folderName={folderName}
            />
          )}
          {type === 'sharing' && folderPath && folderName && accountId && (
            <ShareFolderDialog
              open={true}
              onOpenChange={(open) => !open && setType(null)}
              accountId={accountId}
              folderPath={folderPath}
              folderName={folderName}
            />
          )}
          {type === 'delete' && folderPath && folderName && accountId && (
            <DeleteFolderDialog
              open={true}
              onOpenChange={(open) => !open && setType(null)}
              accountId={accountId}
              folderPath={folderPath}
              folderName={folderName}
            />
          )}
          {type === 'new_subfolder' && folderPath && accountId && (
            <CreateFolderDialog
              open={true}
              onOpenChange={(open) => !open && setType(null)}
              accountId={accountId}
              parentPath={folderPath}
            />
          )}
        </>
      )}
    </>
  )
}

export default SidebarItem
