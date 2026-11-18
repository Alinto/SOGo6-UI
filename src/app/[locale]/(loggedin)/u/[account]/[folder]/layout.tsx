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
import { useCurrentFolder } from '@/features/mails/hooks/use-current-folder'
import { useSyncAdvancedSearchFromUrl } from '@/features/mails/hooks/use-sync-advanced-search-from-url'
import { getFolderDisplayName } from '@/features/mails/utils/folder-path-from-params'
import OfflineUnavailable from '@/features/offline/components/offline-unavailable'
import OutboxPanel from '@/features/offline/components/outbox-panel'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAppSelector } from '@/lib/redux/hooks'
import type { RootState } from '@/lib/redux/store'
import { useTranslations } from 'next-intl'
import React from 'react'
import { MailDetailPage } from './[mail_id]/page'

function MailLayoutInner({
  children,
  classic,
}: {
  children: React.ReactNode
  classic: React.ReactNode
}) {
  const { folderPath, folderType: currentFolderType } = useCurrentFolder()
  const tFolders = useTranslations('MAILS_COMMONS')
  const folderTitle = folderPath
    ? getFolderDisplayName(
        folderPath,
        (key) => tFolders(key as 'folders.inbox.string'),
        currentFolderType
      )
    : null
  useDocumentTitle(folderTitle)
  const { data } = useGetPreferencesQuery()
  const layoutType = data?.layoutType || 'modern'
  const isMobile = useIsMobile()
  const mailLayoutMode = useAppSelector(
    (state: RootState) => state.mailLayout.mode
  )
  const { isOpen, activeModule, openModule, closeModule } =
    useFastAccessRequired()
  const { view, closeOverlay } = useOfflineNav()
  useSyncAdvancedSearchFromUrl()

  const isSplitMode = mailLayoutMode === 'split' && !isMobile
  const isClassicLayout = layoutType === 'classic' || isSplitMode
  const isFullPaneOverlay =
    view.kind === 'outbox' ||
    view.kind === 'mail' ||
    view.kind === 'unavailable'

  const folderContent = isClassicLayout ? classic : children
  const content =
    view.kind === 'outbox' ? (
      <OutboxPanel />
    ) : view.kind === 'mail' ? (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2">
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
        onOpenChange={(open) =>
          open ? openModule(activeModule ?? 'calendar') : closeModule()
        }
        width={`calc(${SIDEBAR_WIDTH} - 1.5rem)`}
        className="min-w-0 flex-1"
      >
        <SidebarInset
          as="div"
          // Fixed height: the toolbar takes what it needs (one or two lines,
          // or none) and the content gets the rest.
          className="flex h-[calc(100vh-var(--header-height))] min-h-0 min-w-0 flex-col overflow-x-hidden"
        >
          {!isFullPaneOverlay && <ListToolbar />}
          <div
            data-testid="folder-content"
            className="flex min-h-0 w-full min-w-0 flex-1 overflow-hidden p-1"
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
