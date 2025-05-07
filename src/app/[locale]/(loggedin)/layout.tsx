'use client'

import AppHeader from '@/components/app-header'
import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <div className="bg-secondary flex flex-1 flex-col gap-4 rounded-tl-lg p-4 pt-2">
            {children}
          </div>
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
  )
}
