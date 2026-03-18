'use client'

import AppHeader from '@/components/app-header'
import { useAppSelector } from '@/lib/redux/hooks'
import { useRouter } from '@/lib/i18n/navigation'
import { DemoWarningToast } from '@/components/demo-warning-toast'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

function ProfilePrefetch() {
  useGetUserProfileQuery()
  return null
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)
  const { push } = useRouter()

  useEffect(() => {
    if (!token) {
      push('/auth/login')
    }
  }, [token, push])

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
  const [connect] = useConnectSSEMutation()

  useEffect(() => {
    const config = getSSEConfigForEnvironment()
    connect(config)
  }, [connect])

  if (!token) return null

  return (
    <>
      <ProfilePrefetch />
      <DemoWarningToast />
      <NotificationToaster />
      <NotificationProvider />
      <SidebarProvider>
        <DndContext sensors={sensors}>
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
    </>
  )
}
