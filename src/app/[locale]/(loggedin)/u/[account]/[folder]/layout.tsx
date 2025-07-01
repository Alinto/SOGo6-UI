'use client'

import {
  SIDEBAR_WIDTH,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useGetPreferencesQuery } from '@/features/app-data/store/user-preferences-api'
import FastAccessContent from '@/features/mails/components/sidebars/fast-access/content'
import SidebarFastAccess from '@/features/mails/components/sidebars/fast-access/sidebar-fast-access'
import React from 'react'

export default function Layout({
  children,
  classic,
}: {
  children: React.ReactNode
  classic: React.ReactNode
}) {
  const { data } = useGetPreferencesQuery()
  const layoutType = data?.layoutType || 'modern'
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [fastAccessContentName, setFastAccessContentName] = React.useState<
    string | undefined
  >(undefined)

  console.log('Layout Type:', fastAccessContentName, sidebarOpen)

  if (layoutType === 'classic') {
    return (
      <SidebarProvider name="right-mail-sidebar" width="2.5rem" defaultOpen>
        <SidebarProvider
          name="right-mail-sidebar-2"
          defaultOpen={false}
          open={sidebarOpen}
          width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
        >
          <SidebarInset>
            <div className="flex h-full w-full flex-col overflow-auto p-2">
              {classic}
            </div>
          </SidebarInset>
          {sidebarOpen && <FastAccessContent name={fastAccessContentName} />}
        </SidebarProvider>
        <SidebarFastAccess
          handleOpen={(name) => {
            if (!fastAccessContentName) {
              setSidebarOpen(true)
              setFastAccessContentName(undefined)
            } else if (name === fastAccessContentName) {
              setSidebarOpen(false)
              setFastAccessContentName(undefined)
            } else {
              setSidebarOpen(true)
              setFastAccessContentName(name)
            }
          }}
        />

        {/* SidebarTrigger fixed to bottom right */}
        <div className="fixed right-0 bottom-4 z-50">
          <SidebarTrigger className="rounded-r-none" />
        </div>
      </SidebarProvider>
    )
  }
  if (layoutType === 'modern') {
    return (
      <SidebarProvider name="right-mail-sidebar" width="2.5rem" defaultOpen>
        <SidebarProvider
          name="right-mail-sidebar-2"
          defaultOpen={false}
          open={sidebarOpen}
          width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
        >
          <SidebarInset>
            <div className="flex h-full w-full flex-col overflow-auto p-2">
              {children}
            </div>
          </SidebarInset>
          {sidebarOpen && <FastAccessContent name={fastAccessContentName} />}
        </SidebarProvider>
        <SidebarFastAccess
          handleOpen={(name) => {
            if (!fastAccessContentName) {
              setSidebarOpen(true)
              setFastAccessContentName(name)
            } else if (name === fastAccessContentName) {
              setSidebarOpen(false)
              setFastAccessContentName(undefined)
            } else {
              setFastAccessContentName(name)
            }
          }}
        />
        {/* SidebarTrigger fixed to bottom right */}
        <div className="fixed right-0 bottom-4 z-50">
          <SidebarTrigger className="rounded-r-none" reverseIcon />
        </div>
      </SidebarProvider>
    )
  }
}
