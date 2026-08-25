'use client'

import ModuleRail from '@/components/sidebar/module-rail'
import {
  SIDEBAR_WIDTH,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { useGetPreferencesQuery } from '@/features/app-data/store/user-preferences-api'
import ListToolbar from '@/features/mails/components/list/list-toolbar'
import MailSSEListener from '@/features/mails/components/mail-sse-listener'
import FastAccessContent from '@/features/mails/components/sidebars/fast-access/content'
import {
  FastAccessProvider,
  useFastAccessRequired,
} from '@/features/mails/components/sidebars/fast-access/context'
import { useListToolbarMode } from '@/features/mails/hooks/use-list-toolbar-mode'
import OfflineUnavailable from '@/features/offline/components/offline-unavailable'
import OutboxPanel from '@/features/offline/components/outbox-panel'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { cn } from '@/lib/utils'
import React from 'react'
import { MailDetailPage } from './[mail_id]/page'

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
  const { view, closeOverlay } = useOfflineNav()

  const isSplitMode = mailLayoutMode === 'split' && !isMobile
  const isClassicLayout = layoutType === 'classic' || isSplitMode
  const isFullPaneOverlay =
    view.kind === 'outbox' ||
    view.kind === 'mail' ||
    view.kind === 'unavailable'
  const effectiveToolbarMode = isFullPaneOverlay ? 'hidden' : toolbarMode

  const folderContent = isClassicLayout ? classic : children
  const content =
    view.kind === 'outbox' ? (
      <OutboxPanel />
    ) : view.kind === 'mail' ? (
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        <MailDetailPage
          account={view.accountId}
          folder={view.folderPath}
          mailId={view.mailId}
          onBack={closeOverlay}
        />
      </div>
    ) : view.kind === 'unavailable' ? (
      <OfflineUnavailable
        force
        target={view.target}
        label={view.label ?? view.path}
      />
    ) : (
      folderContent
    )

  return (
    <SidebarProvider
      name="right-global-rail"
      width="2.5rem"
      defaultOpen
      className="min-w-0"
    >
      <MailSSEListener />
      <SidebarProvider
        name="right-mail-sidebar-2"
        defaultOpen={false}
        open={isOpen}
        width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
        className="min-w-0 flex-1"
      >
        <SidebarInset className="flex min-w-0 flex-col overflow-x-hidden">
          {!isFullPaneOverlay && <ListToolbar />}
          <div
            className={cn(
              'flex w-full min-w-0 overflow-hidden p-1',
              effectiveToolbarMode === 'hidden'
                ? 'h-[calc(100vh-var(--header-height))]'
                : 'h-[calc(100vh-var(--header-height)-52px)]'
            )}
          >
            <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
              {content}
            </div>
          </div>
        </SidebarInset>
        {isOpen && activeModule && <FastAccessContent name={activeModule} />}
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
