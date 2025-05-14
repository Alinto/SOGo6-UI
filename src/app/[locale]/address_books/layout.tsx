import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from '@/features/address_books/components/sidebar/sidebar'
import React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Sidebar />
      </AppSidebar>
      <SidebarInset>
        <AppHeader />
        <div className="rounded-tl-2xl bg-secondary flex flex-1 flex-col gap-4 p-4 pt-2">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
