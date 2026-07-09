'use client'

import ModuleRail from '@/components/sidebar/module-rail'
import {
  SIDEBAR_WIDTH,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useGetPreferencesQuery } from '@/features/app-data/store/user-preferences-api'
import FastAccessContent from '@/features/mails/components/sidebars/fast-access/content'
import {
  FastAccessProvider,
  useFastAccessRequired,
} from '@/features/mails/components/sidebars/fast-access/context'
import ListToolbar from '@/features/mails/components/list/list-toolbar'
import { useListToolbarMode } from '@/features/mails/hooks/use-list-toolbar-mode'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import React from 'react'

function MailLayoutInner({
  children,
  classic,
}: {
  children: React.ReactNode
  classic: React.ReactNode
}) {
  const { data } = useGetPreferencesQuery()
  const layoutType = data?.layoutType || 'modern'
  const isMobile = useIsMobile()
  const mailLayoutMode = useAppSelector(
    (state: RootState) => state.mailLayout.mode
  )
  const { isOpen, activeModule, closeModule } = useFastAccessRequired()
  const toolbarMode = useListToolbarMode()

  const isSplitMode = mailLayoutMode === 'split' && !isMobile
  const isClassicLayout = layoutType === 'classic' || isSplitMode

  const content = isClassicLayout ? classic : children

  return (
    <SidebarProvider
      name="right-global-rail"
      width="2.5rem"
      defaultOpen
      className="min-w-0"
    >
      <SidebarProvider
        name="right-mail-sidebar-2"
        defaultOpen={false}
        open={isOpen}
        width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
        className="min-w-0 flex-1"
      >
        <SidebarInset className="flex min-w-0 flex-col overflow-x-hidden">
          <ListToolbar />
          <div
            className={cn(
              'flex w-full overflow-hidden p-1',
              toolbarMode === 'hidden'
                ? 'h-[calc(100vh-var(--header-height))]'
                : 'h-[calc(100vh-var(--header-height)-52px)]'
            )}
          >
            {content}
          </div>
        </SidebarInset>
        {isOpen && activeModule && (
          <FastAccessContent name={activeModule} />
        )}
        {!isMobile && (
          <div className="fixed right-0 bottom-4 z-50">
            <SidebarTrigger
              className="rounded-r-none"
              reverseIcon={!isClassicLayout}
              onClose={closeModule}
            />
          </div>
        )}
      </SidebarProvider>
      <ModuleRail />
    </SidebarProvider>
  )
}

export default function Layout({
  children,
  classic,
}: {
  children: React.ReactNode
  classic: React.ReactNode
}) {
  return (
    <FastAccessProvider>
      <MailLayoutInner classic={classic}>{children}</MailLayoutInner>
    </FastAccessProvider>
  )
}
