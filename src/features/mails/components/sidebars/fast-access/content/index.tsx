import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import type { FastAccessModuleId } from '@/features/mails/components/sidebars/fast-access/context'
import React from 'react'
import AddressBookContent from './address-book-content'
import CalendarContent from './calendar-content'
import NotesContent from './notes-content'
import TasksContent from './tasks-content'

type FastAccessContentProps = {
  name: FastAccessModuleId
}

const CONTENT_MAP: Record<FastAccessModuleId, React.ReactElement> = {
  'address-book': <AddressBookContent />,
  notes: <NotesContent />,
  tasks: <TasksContent />,
  calendar: <CalendarContent />,
}

const FastAccessContent: React.FC<FastAccessContentProps> = ({ name }) => {
  const ContentComponent = CONTENT_MAP[name]

  return (
    <Sidebar
      className={`text-sidebar-foreground-secondary bg-sidebar-background-secondary mt-12 mr-10 border-0`}
      side="right"
    >
      <SidebarContent
        className={`scrollbar-thin-gray overflow-x-hidden overflow-y-auto border-0`}
      >
        {ContentComponent}
      </SidebarContent>
    </Sidebar>
  )
}

export default FastAccessContent
