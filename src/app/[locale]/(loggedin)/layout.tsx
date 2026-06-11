'use client'

import AppHeader from '@/components/app-header'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from 'next/navigation'
import { DemoWarningToast } from '@/components/demo-warning-toast'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import ContactFormHost from '@/features/address_books/components/contact-form-host'
import DistributionListFormHost from '@/features/address_books/components/distribution-list-form-host'
import { useAddressBookDragEnd } from '@/features/address_books/hooks/use-address-book-drag-end'
import FloatingComposeContainer from '@/features/mails/components/compose/floating-compose-container'
import {
  NotificationProvider,
  NotificationToaster,
} from '@/features/notifications'
import { useGetUserProfileQuery } from '@/features/user-profile'
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
} from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { Contact2 } from 'lucide-react'
import React, { startTransition, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

function ProfilePrefetch() {
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
    if (isHydrated && !token) {
      router.push('/auth/login')
    }
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
  const [connect] = useConnectSSEMutation()

  useEffect(() => {
    const config = getSSEConfigForEnvironment()
    connect(config)
  }, [connect])

  if (!isHydrated || !token) return null

  return (
    <>
      <ProfilePrefetch />
      <DemoWarningToast />
      <NotificationToaster />
      <NotificationProvider />
      <SidebarProvider name="left-global-sidebar">
        <DndContext sensors={sensors} onDragEnd={handleAddressBookDragEnd}>
          <AppSidebar />
          <SidebarInset className="flex h-screen flex-col">
            <AppHeader />
            <div className="flex-1 gap-4 border-y">{children}</div>
          </SidebarInset>
          {typeof window !== 'undefined' &&
            ReactDOM.createPortal(
              <DragOverlay modifiers={[snapCenterToCursor]}>
                <div className="h-10 w-10">
                  <Contact2 className="h-7 w-7 text-gray-700" />
                </div>
              </DragOverlay>,
              document.body
            )}
        </DndContext>
      </SidebarProvider>
      <FloatingComposeContainer />
      <ContactFormHost />
      <DistributionListFormHost />
    </>
  )
}
