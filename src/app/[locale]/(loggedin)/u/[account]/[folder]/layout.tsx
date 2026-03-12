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
import ListToolbar from '@/features/mails/components/list/list-toolbar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import React, { useCallback } from 'react'

type FastAccessContentName =
  | ''
  | 'address-book'
  | 'notes'
  | 'tasks'
  | 'calendar'

export default function Layout({
  children,
  classic,
}: {
  children: React.ReactNode
  classic: React.ReactNode
}) {
  const { data } = useGetPreferencesQuery()
  const layoutType = data?.layoutType || 'modern'
  const isMobile = useIsMobile()
  const mailLayoutMode = useAppSelector((state: RootState) => state.mailLayout.mode)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [fastAccessContentName, setFastAccessContentName] =
    React.useState<FastAccessContentName>('')

  const isSplitMode = mailLayoutMode === 'split' && !isMobile
  const isClassicLayout = layoutType === 'classic' || isSplitMode

  const handleFastAccessToggle = useCallback(
    (name: string) => {
      const isSamePanel = name === fastAccessContentName
      const typedName = name as FastAccessContentName

      if (isSamePanel) {
        // Close the panel if clicking the same button
        setSidebarOpen(false)
        setFastAccessContentName('')
      } else {
        // Open or switch to a different panel
        setSidebarOpen(true)
        setFastAccessContentName(typedName)
      }
    },
    [fastAccessContentName]
  )

  const content = isClassicLayout ? classic : children

  return (
    <SidebarProvider name="right-mail-sidebar" width="2.5rem" defaultOpen>
      <SidebarProvider
        name="right-mail-sidebar-2"
        defaultOpen={false}
        open={sidebarOpen}
        width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
      >
        <SidebarInset className="flex flex-col">
          <ListToolbar />
          <div className="flex h-[calc(100vh-var(--header-height)-52px)] w-full overflow-hidden p-1">
            {content}
          </div>
        </SidebarInset>
        {sidebarOpen && <FastAccessContent name={fastAccessContentName} />}
      </SidebarProvider>
      <SidebarFastAccess handleOpen={handleFastAccessToggle} />
      {/* SidebarTrigger fixed to bottom right */}
      {!isMobile && (
        <div className="fixed right-0 bottom-4 z-50">
          <SidebarTrigger
            className="rounded-r-none"
            reverseIcon={!isClassicLayout}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}
    </SidebarProvider>
  )
}
