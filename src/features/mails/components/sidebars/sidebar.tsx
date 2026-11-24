'use client'

import IconRail from '@/components/sidebar/icon-rail'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import OutboxSidebarItem from '@/features/offline/components/outbox-sidebar-item'
import { useMailCache } from '@/features/offline/hooks/use-mail-cache'
import { useOfflineFolders } from '@/features/offline/hooks/use-offline-folders'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { useIsIconRail } from '@/hooks/use-is-icon-rail'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'
import { flattenSpecialFolders } from '../../utils/flatten-special-folders'
import { folderPathFromParams } from '../../utils/folder-path-from-params'
import {
  canOpenFolder,
  getPermissionsForFolder,
} from '../../utils/folder-permissions'
import {
  getFolderTranslationKey,
  isVirtualFolder,
} from '../../utils/folder-type-helpers'
import {
  insertOutboxInFolderList,
  isOutboxListSentinel,
} from '../../utils/insert-outbox-in-folder-list'
import { iconSelectorByType, nameSelectorByType } from '../utils'
import { AccountSwitcher } from './account-switcher'
import ComposeOpener from './compose-opener'
import FolderDroppable from './folder-droppable'
import { MailboxQuota } from './mailbox-quota'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

/** Display name, active path and navigation shared by every folder entry. */
function useFolderNavigation(folder: ImapFolder) {
  const { account, folder: urlFolderParam } = useParams()
  const t = useTranslations('MAILS_COMMONS')
  const { openFolder, folderPathOverride } = useOfflineNav()

  const accountId = String(account ?? '0')
  const urlFolder = folderPathFromParams(
    urlFolderParam as string | string[] | undefined
  )
  const activeFolder = folderPathOverride ?? urlFolder
  // A folder the user can see (`l`) but not read (`r`) is listed, but can't be opened.
  const isOpenable = canOpenFolder(folder)

  const typeTranslationKey =
    getFolderTranslationKey(folder.type) ?? nameSelectorByType(folder.type)
  const displayName = typeTranslationKey ? t(typeTranslationKey) : folder.name

  const navigateToFolder = () => {
    if (!isOpenable) return
    void openFolder(accountId, folder.path, displayName)
  }

  return { accountId, activeFolder, displayName, isOpenable, navigateToFolder }
}

interface FolderEntryProps {
  folder: ImapFolder
  accountId: string
  displayName: string
  isActive: boolean
  handleClick: () => void
  hasSubfolders?: boolean
  isOpen?: boolean
  onToggleExpand?: () => void
  onDwellExpand?: () => void
}

function FolderEntry({
  folder,
  accountId,
  displayName,
  isActive,
  handleClick,
  hasSubfolders = false,
  isOpen,
  onToggleExpand,
  onDwellExpand,
}: FolderEntryProps) {
  const isVirtual = isVirtualFolder(folder)
  const permissions = getPermissionsForFolder(folder)

  return (
    <FolderDroppable
      folderPath={folder.path}
      folderType={folder.type}
      folderName={displayName}
      selectable={folder.selectable}
      isVirtual={isVirtual}
      hasSubfolders={hasSubfolders}
      canInsert={permissions.canInsert}
      onDwellExpand={onDwellExpand}
    >
      <SidebarItem
        icon={iconSelectorByType(folder.type)}
        isDefault={folder.default}
        isOpen={isOpen}
        name={displayName}
        isActive={isActive}
        handleClick={handleClick}
        onExpandClick={
          onToggleExpand
            ? (e) => {
                e.stopPropagation()
                onToggleExpand()
              }
            : undefined
        }
        folderPath={folder.path}
        folderName={folder.name}
        accountId={accountId}
        hasSubfolders={hasSubfolders}
        selectable={folder.selectable}
        isVirtual={isVirtual}
        unseenCount={folder.unseen_count}
        folderType={folder.type}
        folderDelimiter={folder.delimiter}
        folderRights={folder.rights}
      />
    </FolderDroppable>
  )
}

interface FolderItemProps {
  folder: ImapFolder
}

/** Icon-rail entry: one special folder, never expandable. */
function FlatFolderItem({ folder }: FolderItemProps) {
  const { accountId, activeFolder, displayName, navigateToFolder } =
    useFolderNavigation(folder)

  return (
    <SidebarMenuItem>
      <FolderEntry
        folder={folder}
        accountId={accountId}
        displayName={displayName}
        isActive={activeFolder === folder.path}
        handleClick={navigateToFolder}
      />
    </SidebarMenuItem>
  )
}

function RecursiveFolderItem({ folder }: FolderItemProps) {
  const { accountId, activeFolder, displayName, isOpenable, navigateToFolder } =
    useFolderNavigation(folder)

  const hasSubfolders =
    Array.isArray(folder.subfolders) && folder.subfolders.length > 0

  const descendantActive =
    hasSubfolders && activeFolder.startsWith(folder.path + folder.delimiter)

  const [open, setOpen] = useState(false)
  const effectiveOpen = descendantActive || open
  const expandFolder = useCallback(() => setOpen(true), [])

  const toggleExpand = () => {
    setOpen((prev) => !prev)
  }

  const handleClick = () => {
    if (!isOpenable) {
      if (hasSubfolders) toggleExpand()
      return
    }
    if (hasSubfolders) {
      toggleExpand()
      navigateToFolder()
      return
    }
    navigateToFolder()
  }

  const sidebarItem = (
    <FolderEntry
      folder={folder}
      accountId={accountId}
      displayName={displayName}
      isActive={activeFolder === folder.path}
      handleClick={handleClick}
      hasSubfolders={hasSubfolders}
      isOpen={hasSubfolders ? effectiveOpen : undefined}
      onToggleExpand={hasSubfolders ? toggleExpand : undefined}
      onDwellExpand={hasSubfolders ? expandFolder : undefined}
    />
  )

  if (!hasSubfolders) {
    return <SidebarMenuItem>{sidebarItem}</SidebarMenuItem>
  }

  return (
    <Collapsible open={effectiveOpen} onOpenChange={setOpen}>
      <SidebarMenuItem>
        {sidebarItem}
        <CollapsibleContent className="w-full">
          <SidebarMenuSub className="mr-0 pr-0">
            {folder.subfolders?.map((sub) => (
              <SidebarMenuSubItem key={sub.path}>
                <RecursiveFolderItem folder={sub} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function MailSidebar() {
  const { account } = useParams()
  const accountId = String(account ?? '0')
  const { data, isFetching } = useGetFoldersQuery({
    accountId,
  })
  const { cacheFolders } = useMailCache()
  const t = useTranslations('MAILS_COMMONS')
  // Icon rail (desktop, collapsed): only special folders, all on one level.
  const isIconRail = useIsIconRail()

  useEffect(() => {
    if (data) void cacheFolders(accountId, data)
  }, [accountId, cacheFolders, data])

  // Offline cold start: the folders query has no data — show the cached tree
  const offlineFolders = useOfflineFolders(accountId, !!data)
  const folders = data ?? offlineFolders ?? undefined

  if (isFetching && !folders) return <SidebarSkeleton />

  return (
    <>
      <SidebarGroup className="sticky top-0 z-10 ml-0 px-2 pt-2 pb-1 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <ComposeOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <AccountSwitcher />
        </SidebarMenu>
        <MailboxQuota />
      </SidebarGroup>
      {isIconRail ? (
        <IconRail
          sections={[
            flattenSpecialFolders(folders ?? []).map((folder) => (
              <FlatFolderItem key={folder.path} folder={folder} />
            )),
          ]}
          moreLabel={(count) => t('folders.rail_more.string', { count })}
        />
      ) : (
        <SidebarGroup className="scrollbar-thin-gray min-h-0 flex-1 overflow-y-auto group-data-[collapsible=icon]:p-0">
          <SidebarMenu>
            {insertOutboxInFolderList(folders ?? []).map((node) =>
              isOutboxListSentinel(node) ? (
                <OutboxSidebarItem key="outbox" />
              ) : (
                <RecursiveFolderItem key={node.path} folder={node} />
              )
            )}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  )
}

export default MailSidebar
