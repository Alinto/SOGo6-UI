'use client'

import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'
import { folderPathFromParams } from '../../utils/folder-path-from-params'
import {
  getFolderTranslationKey,
  isVirtualFolder,
} from '../../utils/folder-type-helpers'
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
  const { push } = useRouter()
  const { account, folder: urlFolderParam } = useParams()
  const t = useTranslations('MAILS_COMMONS')

  const urlFolder = folderPathFromParams(
    urlFolderParam as string | string[] | undefined
  )

  const isActive = urlFolder === folder.path
  const isVirtual = isVirtualFolder(folder)

  const hasSubfolders =
    Array.isArray(folder.subfolders) && folder.subfolders.length > 0

  const descendantActive =
    hasSubfolders && urlFolder.startsWith(folder.path + folder.delimiter)

  const [open, setOpen] = useState(false)
  const effectiveOpen = descendantActive || open

  const typeTranslationKey =
    getFolderTranslationKey(folder.type) ?? nameSelectorByType(folder.type)
  const displayName = typeTranslationKey ? t(typeTranslationKey) : folder.name

  const navigateToFolder = () => {
    if (isVirtual) return
    push(`/u/${account}/${encodeURIComponent(folder.path)}`)
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
  const { data, isFetching } = useGetFoldersQuery({
    accountId: String(account ?? '0'),
  })
  if (isFetching) return <SidebarSkeleton />

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
          {data?.map((folder) => (
            <RecursiveFolderItem key={folder.path} folder={folder} />
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  )
}

export default MailSidebar
