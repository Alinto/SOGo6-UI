'use client'

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
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'
import { folderPathFromParams } from '../../utils/folder-path-from-params'
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
import { MailboxQuota } from './mailbox-quota'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

interface RecursiveFolderItemProps {
  folder: ImapFolder
}

function RecursiveFolderItem({ folder }: RecursiveFolderItemProps) {
  const { account, folder: urlFolderParam } = useParams()
  const t = useTranslations('MAILS_COMMONS')
  const { openFolder, folderPathOverride } = useOfflineNav()

  const urlFolder = folderPathFromParams(
    urlFolderParam as string | string[] | undefined
  )

  const activeFolder = folderPathOverride ?? urlFolder
  const isActive = activeFolder === folder.path
  const isVirtual = isVirtualFolder(folder)

  const hasSubfolders =
    Array.isArray(folder.subfolders) && folder.subfolders.length > 0

  const descendantActive =
    hasSubfolders && activeFolder.startsWith(folder.path + folder.delimiter)

  const [open, setOpen] = useState(false)
  const effectiveOpen = descendantActive || open

  const typeTranslationKey =
    getFolderTranslationKey(folder.type) ?? nameSelectorByType(folder.type)
  const displayName = typeTranslationKey ? t(typeTranslationKey) : folder.name

  const navigateToFolder = () => {
    if (isVirtual) return
    void openFolder(String(account ?? '0'), folder.path, displayName)
  }

  const toggleExpand = () => {
    setOpen((prev) => !prev)
  }

  const handleClick = () => {
    if (isVirtual) {
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

  if (!hasSubfolders) {
    return (
      <SidebarMenuItem>
        <SidebarItem
          icon={iconSelectorByType(folder.type)}
          isDefault={folder.default}
          name={displayName}
          isActive={isActive}
          handleClick={handleClick}
          folderPath={folder.path}
          folderName={folder.name}
          accountId={String(account ?? '0')}
          hasSubfolders={false}
          selectable={folder.selectable}
          isVirtual={isVirtual}
          unseenCount={folder.unseen_count}
          folderType={folder.type}
          folderDelimiter={folder.delimiter}
        />
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={effectiveOpen}
      onOpenChange={setOpen}
      className="group-data-[collapsible=icon]:hidden"
    >
      <SidebarMenuItem>
        <SidebarItem
          icon={iconSelectorByType(folder.type)}
          isDefault={folder.default}
          isOpen={effectiveOpen}
          name={displayName}
          isActive={isActive}
          handleClick={handleClick}
          onExpandClick={(e) => {
            e.stopPropagation()
            toggleExpand()
          }}
          folderPath={folder.path}
          folderName={folder.name}
          accountId={String(account ?? '0')}
          hasSubfolders
          selectable={folder.selectable}
          isVirtual={isVirtual}
          unseenCount={folder.unseen_count}
          folderType={folder.type}
          folderDelimiter={folder.delimiter}
        />
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

  useEffect(() => {
    if (data) void cacheFolders(accountId, data)
  }, [accountId, cacheFolders, data])

  // Offline cold start: the folders query has no data — show the cached tree
  const offlineFolders = useOfflineFolders(accountId, !!data)
  const folders = data ?? offlineFolders ?? undefined

  if (isFetching && !folders) return <SidebarSkeleton />

  return (
    <>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <AccountSwitcher />
        </SidebarMenu>
        <MailboxQuota />
      </SidebarGroup>
      <SidebarGroup className="sticky top-0 z-10 ml-0 py-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <ComposeOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
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
    </>
  )
}

export default MailSidebar
