'use client'

import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import Sidebar from '@/features/address_books/components/sidebar/sidebar'
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
import React from 'react'
import ReactDOM from 'react-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
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
  return (
    <SidebarProvider>
      <DndContext sensors={sensors}>
        <AppSidebar>
          <Sidebar />
        </AppSidebar>
        <SidebarInset>
          <AppHeader />
          <div className="flex flex-1 flex-col gap-4">{children}</div>
        </SidebarInset>
        {typeof window !== 'undefined' &&
          ReactDOM.createPortal(
            <DragOverlay modifiers={[snapCenterToCursor]}>
              <div className="w-10 h-10">
                <Contact2 className="w-7 h-7 text-gray-700" />
              </div>
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </SidebarProvider>
  )
}
