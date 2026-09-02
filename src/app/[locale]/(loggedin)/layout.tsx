'use client'

import AppHeader from '@/components/app-header'
import { DemoWarningToast } from '@/components/demo-warning-toast'
import { appCollisionDetection } from '@/components/dnd/collision'
import { isMailDragData, type AppDragData } from '@/components/dnd/types'
import MobileCreateFab from '@/components/mobile-create-fab'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import ContactFormHost from '@/features/address_books/components/contact-form-host'
import DistributionListFormHost from '@/features/address_books/components/distribution-list-form-host'
import { useAddressBookDragEnd } from '@/features/address_books/hooks/use-address-book-drag-end'
import { LoginForm } from '@/features/auth/components/login-form'
import LoginShell from '@/features/auth/components/login-shell'
import FloatingComposeContainer from '@/features/mails/components/compose/floating-compose-container'
import MailDragOverlay from '@/features/mails/components/mail-drag-overlay'
import MailDragSession from '@/features/mails/components/mail-drag-session'
import { useMailDragEnd } from '@/features/mails/hooks/use-mail-drag-end'
import { resolveDraggedMailIds } from '@/features/mails/utils/mail-folder-drop'
import {
  NotificationProvider,
  NotificationToaster,
} from '@/features/notifications'
import { redirectAfterLogout } from '@/features/offline/auth/redirect-after-logout'
import OfflineProvider from '@/features/offline/components/offline-provider'
import { useCalendarPrefetch } from '@/features/offline/hooks/use-calendar-prefetch'
import { useComposeDeepLink } from '@/features/offline/hooks/use-compose-deep-link'
import { cacheIdentities } from '@/features/offline/hooks/use-offline-draft-sync'
import { shouldSkipDocumentNav } from '@/features/offline/network/skip-document-nav'
import { useInboxPrefetch } from '@/features/offline/prefetch/use-inbox-prefetch'
import { useGetUserProfileQuery, useProfile } from '@/features/user-profile'
import { fetchEnvVars } from '@/lib/env-service'
import { useAppSelector } from '@/lib/redux/hooks'
import {
  getSSEConfigForEnvironment,
  useConnectSSEMutation,
} from '@/lib/redux/sse'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { Contact2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { startTransition, useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

function ComposeDeepLink() {
  useComposeDeepLink()
  return null
}

function MailCachePrefetch() {
  useInboxPrefetch()
  useCalendarPrefetch()
  return null
}

function ProfilePrefetch() {
  const { mainAccount, identitiesEnabled } = useProfile()
  const userId = useAppSelector((s) => s.auth.user?.uid)

  useEffect(() => {
    if (!userId || !mainAccount?.identities) return
    void cacheIdentities(userId, mainAccount.identities)
  }, [userId, mainAccount?.identities, identitiesEnabled])

  useGetUserProfileQuery()
  return null
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setIsHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!isHydrated || token) return
    if (shouldSkipDocumentNav(navigator.onLine, false)) return
    redirectAfterLogout((href) => router.push(href))
  }, [isHydrated, token, router])

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  })
  const sensors = useSensors(mouseSensor, touchSensor)
  const handleAddressBookDragEnd = useAddressBookDragEnd()
  const handleMailDragEnd = useMailDragEnd()
  const selectedMailIds = useAppSelector(
    (state) => state.mailLayout?.selectedMailIds ?? []
  )
  const [activeDrag, setActiveDrag] = useState<AppDragData | null>(null)
  const [connect] = useConnectSSEMutation()

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current
      if (isMailDragData(data)) {
        setActiveDrag({
          ...data,
          count: resolveDraggedMailIds(data.mailId, selectedMailIds).length,
        })
        return
      }
      if (data && typeof data === 'object' && 'type' in data) {
        setActiveDrag(data as AppDragData)
      }
    },
    [selectedMailIds]
  )

  const clearActiveDrag = useCallback(() => {
    setActiveDrag(null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      handleMailDragEnd(event)
      handleAddressBookDragEnd(event)
      setActiveDrag(null)
    },
    [handleAddressBookDragEnd, handleMailDragEnd]
  )

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const envVars = await fetchEnvVars()
      if (cancelled || envVars.SSE_ENABLED === false) {
        return
      }

      const config = await getSSEConfigForEnvironment()
      if (!cancelled) {
        connect(config)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [connect])

  if (!isHydrated) return null
  if (!token) {
    if (shouldSkipDocumentNav(navigator.onLine, false)) {
      return (
        <LoginShell>
          <LoginForm />
        </LoginShell>
      )
    }
    return null
  }

  return (
    <OfflineProvider>
      <ProfilePrefetch />
      <MailCachePrefetch />
      <ComposeDeepLink />
      <DemoWarningToast />
      <NotificationToaster />
      <NotificationProvider />
      <SidebarProvider name="left-global-sidebar">
        <DndContext
          sensors={sensors}
          collisionDetection={appCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={clearActiveDrag}
        >
          <MailDragSession />
          <AppSidebar />
          <SidebarInset className="flex h-screen min-w-0 flex-col overflow-hidden">
            <AppHeader />
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden border-y">
              {children}
            </div>
          </SidebarInset>
          {typeof window !== 'undefined' &&
            ReactDOM.createPortal(
              <DragOverlay modifiers={[snapCenterToCursor]}>
                {activeDrag && isMailDragData(activeDrag) ? (
                  <MailDragOverlay
                    from={activeDrag.from}
                    subject={activeDrag.subject}
                    count={activeDrag.count}
                  />
                ) : activeDrag ? (
                  <div className="h-10 w-10">
                    <Contact2 className="text-muted-foreground h-7 w-7" />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body
            )}
        </DndContext>
        <MobileCreateFab />
      </SidebarProvider>
      <FloatingComposeContainer />
      <ContactFormHost />
      <DistributionListFormHost />
    </OfflineProvider>
  )
}
