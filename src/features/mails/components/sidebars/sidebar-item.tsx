'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuButton } from '@/components/ui/sidebar'
import { TooltipWrapper } from '@/components/ui/tooltip'
import { useProfile } from '@/features/user-profile'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { ChevronRight, MoreVertical, TriangleAlert } from 'lucide-react'
import type { IconName } from 'lucide-react/dynamic'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { ImapFolderType } from '../../mails-types'
import {
  getFolderActions,
  type FolderActionId,
} from '../../utils/folder-actions'
import { shouldHideUnseenCount } from '../../utils/folder-type-helpers'
import { CreateFolderDialog } from './create-folder-dialog'
import { DeleteFolderDialog } from './delete-folder-dialog'
import { EmptyFolderDialog } from './empty-folder-dialog'
import { ExpungeFolderDialog } from './expunge-folder-dialog'
import { MoveFolderDialog } from './move-folder-dialog'
import { PurgeFolderDialog } from './purge-folder-dialog'
import { RenameFolderDialog } from './rename-folder-dialog'
import { SetFolderTypeDialog } from './set-folder-type-dialog'
import { ShareFolderDialog } from './share-folder-dialog'

interface SidebarItemProps {
  name: string
  icon?: IconName
  isActive?: boolean
  isDefault?: boolean
  disableActions?: boolean
  handleClick: () => void
  onExpandClick?: React.MouseEventHandler<HTMLDivElement>
  collapsible?: boolean
  folderPath?: string
  folderName?: string
  accountId?: string
  hasSubfolders?: boolean
  isOpen?: boolean
  selectable?: boolean
  isVirtual?: boolean
  unseenCount?: number
  folderType?: ImapFolderType
  folderDelimiter?: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  name,
  icon,
  disableActions,
  isActive,
  isDefault,
  handleClick,
  onExpandClick,
  folderPath,
  folderName,
  accountId,
  hasSubfolders,
  isOpen,
  selectable = true,
  isVirtual = false,
  unseenCount = 0,
  folderType,
  folderDelimiter = '/',
}) => {
  const [activeAction, setActiveAction] = React.useState<FolderActionId | null>(
    null
  )
  const { mailPurgeAllow, folderSharingDisabled } = useProfile()
  const t = useTranslations('MAILS_COMMONS')
  const isMobile = useIsMobile()

  const folderActions = getFolderActions(
    {
      type: folderType,
      selectable,
      default: isDefault,
    },
    { mailPurgeAllow, folderSharingDisabled }
  )

  const showUnseenCount =
    unseenCount != null && unseenCount > 0 && !shouldHideUnseenCount(folderType)

  const closeAction = () => setActiveAction(null)

  const renderMenuItem = (action: (typeof folderActions)[number]) => (
    <DropdownMenuItem
      key={action.id}
      disabled={action.disabled}
      title={
        action.disabled && action.disabledReasonKey
          ? t(action.disabledReasonKey)
          : undefined
      }
      onClick={() => {
        if (action.disabled) return
        setActiveAction(action.id)
      }}
      className={cn(
        action.destructive && 'text-destructive focus:text-destructive'
      )}
    >
      <span>{t(action.translationKey)}</span>
    </DropdownMenuItem>
  )

  return (
    <>
      <SidebarMenuButton
        className={cn(
          `h-10 align-middle ${
            !isDefault ? 'group-data-[collapsible=icon]:hidden' : ''
          } group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none`
        )}
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
              if (onExpandClick) {
                onExpandClick(e)
              } else {
                handleClick()
              }
            }}
          >
            <DynamicIcon className="h-5 w-5" name={icon} />
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 group-data-[collapsible=icon]:hidden">
          <span
            className={cn(
              'min-w-0 shrink truncate leading-none',
              isVirtual && 'italic'
            )}
          >
            {name}
          </span>
          {isVirtual ? (
            <TooltipWrapper
              content={t('folders.virtual_folder.string')}
              side="top"
            >
              <TriangleAlert
                aria-hidden
                className="text-warning h-3.5 w-3.5 shrink-0"
              />
            </TooltipWrapper>
          ) : null}
          {hasSubfolders ? (
            <ChevronRight
              aria-hidden
              strokeWidth={2.5}
              className={cn(
                'text-sidebar-foreground/85 h-4 w-4 shrink-0 transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          ) : null}
          {showUnseenCount && (
            <span className="shrink-0 text-xs leading-none font-medium text-inherit tabular-nums">
              {unseenCount > 99 ? '99+' : unseenCount}
            </span>
          )}
        </div>
      </SidebarMenuButton>

      {!disableActions && folderActions.length > 0 && (
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
              {folderActions.map((action, index) => (
                <React.Fragment key={action.id}>
                  {action.separatorBefore && index > 0 ? (
                    <DropdownMenuSeparator />
                  ) : null}
                  {renderMenuItem(action)}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeAction === 'purge' &&
            folderPath &&
            folderName &&
            accountId && (
              <PurgeFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
                hasSubfolders={hasSubfolders ?? false}
              />
            )}
          {activeAction === 'empty_folder' &&
            folderPath &&
            folderName &&
            accountId && (
              <EmptyFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
              />
            )}
          {activeAction === 'expunge' &&
            folderPath &&
            folderName &&
            accountId && (
              <ExpungeFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
              />
            )}
          {activeAction === 'sharing' &&
            folderPath &&
            folderName &&
            accountId && (
              <ShareFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
              />
            )}
          {activeAction === 'delete' &&
            folderPath &&
            folderName &&
            accountId && (
              <DeleteFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
              />
            )}
          {activeAction === 'new_subfolder' && folderPath && accountId && (
            <CreateFolderDialog
              open
              onOpenChange={(open) => !open && closeAction()}
              accountId={accountId}
              parentPath={folderPath}
            />
          )}
          {activeAction === 'rename' &&
            folderPath &&
            folderName &&
            accountId && (
              <RenameFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
                folderDelimiter={folderDelimiter}
              />
            )}
          {activeAction === 'move_to' &&
            folderPath &&
            folderName &&
            accountId && (
              <MoveFolderDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
                folderDelimiter={folderDelimiter}
              />
            )}
          {activeAction === 'set_as' &&
            folderPath &&
            folderName &&
            accountId && (
              <SetFolderTypeDialog
                open
                onOpenChange={(open) => !open && closeAction()}
                accountId={accountId}
                folderPath={folderPath}
                folderName={folderName}
              />
            )}
        </>
      )}
    </>
  )
}

export default SidebarItem
