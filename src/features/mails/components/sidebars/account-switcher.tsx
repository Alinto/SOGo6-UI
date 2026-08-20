'use client'

import {
  Check,
  FolderPlus,
  Mail,
  MoreVertical,
  Plus,
  Users,
} from 'lucide-react'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { CreateFolderDialog } from '@/features/mails/components/sidebars/create-folder-dialog'
import { useProfile } from '@/features/user-profile'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

export function AccountSwitcher() {
  const t = useTranslations('MAILS_COMMONS')
  const { push } = useRouter()
  const { account } = useParams()
  const {
    allMailboxes,
    defaultIdentity,
    canAddExternalAccount,
    isLoading,
    user,
  } = useProfile()
  const [createFolderOpen, setCreateFolderOpen] = React.useState(false)

  // Index courant depuis l'URL (/u/0/INBOX → 0)
  const currentIndex = account ? Number(account) : 0
  const accountId = String(currentIndex)

  // Email d'affichage d'une mailbox
  const getAccountEmail = (mailboxId: string): string => {
    const mailbox = allMailboxes.find((m) => m.id === mailboxId)
    if (!mailbox) return ''
    if (mailboxId === '0') {
      return defaultIdentity?.mail || mailbox.identities?.[0]?.mail || ''
    }
    return mailbox.name || mailbox.identities?.[0]?.mail || ''
  }

  const selectedMailbox = allMailboxes[currentIndex] ?? allMailboxes[0]
  const selectedEmail = selectedMailbox
    ? getAccountEmail(selectedMailbox.id)
    : user?.email || user?.cn || ''

  if (isLoading && !selectedEmail) {
    return (
      <SidebarMenu className="p-0">
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="bg-sidebar group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
            disabled
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:hidden">
              <Mail className="h-5 w-5 opacity-50" />
            </div>
            <div className="flex group-data-[collapsible=icon]:hidden">
              <span className="text-muted-foreground animate-pulse">…</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu className="p-0">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="bg-sidebar data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg group-data-[collapsible=icon]:hidden">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex group-data-[collapsible=icon]:hidden">
                  <span className="truncate">{selectedEmail}</span>
                </div>
                <MoreVertical className="ml-auto h-4 w-4 shrink-0 group-data-[collapsible=icon]:ml-0" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)]"
              align="start"
            >
              {allMailboxes.map((mailbox, index) => (
                <DropdownMenuItem
                  key={mailbox.id}
                  onClick={() => push(`/u/${index}/INBOX`)}
                >
                  <span className="truncate">
                    {getAccountEmail(mailbox.id)}
                  </span>
                  {index === currentIndex && (
                    <Check className="ml-auto h-4 w-4 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                <FolderPlus className="mr-1.5 h-4 w-4" />
                <span>{t('account_switcher.new_folder.string')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Users className="mr-1.5 h-4 w-4" />
                <span>{t('account_switcher.delegate.string')}</span>
              </DropdownMenuItem>

              {canAddExternalAccount && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      push('/user_settings/mail/external_accounts')
                    }
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    <span>{t('account_switcher.add_account.string')}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {createFolderOpen && (
        <CreateFolderDialog
          open={createFolderOpen}
          onOpenChange={setCreateFolderOpen}
          accountId={accountId}
          parentPath=""
        />
      )}
    </>
  )
}
