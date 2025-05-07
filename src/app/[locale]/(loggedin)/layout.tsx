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
          <div className="bg-secondary flex flex-1 flex-col gap-4 rounded-tl-lg p-4 pt-2">
            {children}
          </div>
        </SidebarInset>
        {ReactDOM.createPortal(
          <DragOverlay modifiers={[snapCenterToCursor]}>
            <div className="h-10 w-10">
              <Contact2 className="h-6 w-6 text-gray-500" />
            </div>
          </DragOverlay>,
          document.body // Render the overlay in the body
        )}
      </DndContext>
    </SidebarProvider>
  )
}
