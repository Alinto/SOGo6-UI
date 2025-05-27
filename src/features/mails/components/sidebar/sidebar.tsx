'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { Pencil } from 'lucide-react'
import type { IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { ImapFolder } from '../../mails-types'
import { useGetFoldersQuery } from '../../store/mails-api'
import { AccountSwitcher } from './account-switcher'
import SidebarItem from './sidebar-item'
import SidebarSkeleton from './skeleton'

const iconSelector = (path: string, defaultIcon?: IconName): IconName => {
  if (path === 'INBOX') return 'inbox'
  if (path === 'Sent') return 'send'
  if (path === 'Drafts') return 'file-text'
  if (path === 'Trash') return 'trash-2'
  if (path === 'Junk') return 'alert-triangle'
  if (path === 'Archive') return 'archive'
  if (defaultIcon) return defaultIcon
  return 'folder'
}
const nameSelector = (name: string): string | undefined => {
  if (name === 'INBOX') return 'folders.inbox.string'
  if (name === 'Sent') return 'folders.sent.string'
  if (name === 'Drafts') return 'folders.drafts.string'
  if (name === 'Trash') return 'folders.trash.string'
  if (name === 'Junk') return 'folders.junk.string'
  if (name === 'Archive') return 'folders.archive.string'
  return undefined
}

interface RecursiveFolderItemProps {
  folder: ImapFolder
}

function RecursiveFolderItem({ folder }: RecursiveFolderItemProps) {
  const { push } = useRouter()
  const { account } = useParams()
  const pathname = usePathname()
  const t = useTranslations('Mails')

  const hasSubfolders =
    Array.isArray(folder.subfolders) && folder.subfolders.length > 0
  const name = nameSelector(folder.name)

  if (!hasSubfolders) {
    return (
      <SidebarMenuItem>
        <SidebarItem
          icon={iconSelector(folder.path)}
          id={folder.path}
          name={name ? t(name) : folder.name}
          isActive={pathname.includes(folder.path)}
          onClick={() => {
            push(`/u/${account}/${folder.path}`)
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
            isDefault={folder.path === 'INBOX'}
            onClick={() => {}}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="w-full">
          <SidebarMenuSub className="mr-0 pr-0">
            {folder?.subfolders.map((sub) => (
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
  const t = useTranslations('Mails')
  if (isFetching) return <SidebarSkeleton />

  return (
    <>
      <SidebarGroup className="py-0 pr-0 group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <AccountSwitcher
            accounts={['henry@fafenback.org', 'contact@fafenback.org']}
            defaultAccount={'henry@fafenback.org'}
          />
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup className="bg-background sticky top-0 ml-2 p-0 group-data-[collapsible=icon]:ml-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="bg-secondary h-10 justify-center text-lg group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none">
              <span className="sr-only">{t('new_message.string')}</span>
              <Pencil className="hidden h-5 w-5 transition-transform group-data-[collapsible=icon]:flex" />
              <span className="truncate group-data-[collapsible=icon]:hidden">
                {t('new_message.string')}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="group-data-[collapsible=icon]:p-0">
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
