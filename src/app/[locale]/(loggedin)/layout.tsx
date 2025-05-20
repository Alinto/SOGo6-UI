import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

export default async function RootLayout({
  children,
  sidebars,
}: Readonly<{
  children: React.ReactNode
  sidebars: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar>{sidebars}</AppSidebar>
      <SidebarInset>
        <AppHeader />
        <div className="rounded-tl-lg bg-secondary flex flex-1 flex-col gap-4 p-4 pt-2">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
