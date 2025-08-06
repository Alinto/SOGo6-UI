'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'
import { iconSelector, nameSelector } from '../utils'
import { AccountSwitcher } from './account-switcher'
import ComposeOpener from './compose-opener'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

interface RecursiveFolderItemProps {
  folder: ImapFolder
}

function RecursiveFolderItem({ folder }: RecursiveFolderItemProps) {
  const { push } = useRouter()
  const { account } = useParams()
  const pathname = usePathname()
  const t = useTranslations()

  const hasSubfolders =
    Array.isArray(folder.subfolders) && folder.subfolders.length > 0
  const name = nameSelector(folder.name)

  if (!hasSubfolders) {
    return (
      <SidebarMenuItem>
        <SidebarItem
          icon={iconSelector(folder.path)}
          id={folder.path}
          isDefault={folder.default}
          name={name ? t(name) : folder.name}
          isActive={pathname.includes(folder.path)}
          handleClick={() => {
            push(`/u/${account}/${encodeURIComponent(folder.path)}`)
          }}
        />
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible className="group/collapsible group-data-[collapsible=icon]:hidden [&[data-state=open]>svg:first-child]:rotate-90">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarItem
            icon="chevron-right"
            id={folder.path}
            name={folder.name}
            handleClick={() => {
              push(`/u/${account}/${encodeURIComponent(folder.path)}`)
            }}
          />
        </CollapsibleTrigger>
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
  const { data, isFetching } = useGetFoldersQuery()
  if (isFetching) return <SidebarSkeleton />

  return (
    <>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <AccountSwitcher
            accounts={['henry@fafenback.org', 'contact@fafenback.org']}
            defaultAccount={'henry@fafenback.org'}
          />
        </SidebarMenu>
      </SidebarGroup>
      {/* Sticky header */}
      <SidebarGroup className="sticky top-0 z-10 ml-0 py-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <ComposeOpener />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      {/* Scrollable folders */}
      <SidebarGroup
        className="thin-scrollbar min-h-0 flex-1 overflow-y-auto group-data-[collapsible=icon]:p-0"
        style={{ scrollbarWidth: 'thin' }}
      >
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
