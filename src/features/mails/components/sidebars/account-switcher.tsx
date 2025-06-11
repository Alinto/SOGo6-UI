'use client'

import { Check, ChevronsUpDown, Mail } from 'lucide-react'
import * as React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useRouter } from '@/lib/i18n/navigation'

export function AccountSwitcher({
  accounts,
  defaultAccount,
}: {
  accounts: string[]
  defaultAccount: string
}) {
  const [selectedAccount, setSelectedAccount] = React.useState(defaultAccount)
  const { push } = useRouter()
  return (
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
                <span className="">{selectedAccount}</span>
              </div>
              <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:ml-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {accounts.map((account, i) => (
              <DropdownMenuItem
                key={account}
                onClick={() => {
                  setSelectedAccount(account)
                  push(`/u/${i}/INBOX`)
                }}
              >
                <div className="flex items-center">
                  <span className="truncate">{account}</span>
                </div>
                {account === selectedAccount && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
