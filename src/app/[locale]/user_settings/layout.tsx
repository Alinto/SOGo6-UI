import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { NavBar } from '@/components/nav-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'
import nav from './nav'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <NavBar items={nav} translationsKey="Nav_Settings" />
      </AppSidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-2">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
