import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import React from 'react'
import AddressBookContent from './address-book-content'
import CalendarContent from './calendar-content'
import NotesContent from './notes-content'
import TasksContent from './tasks-content'

type FastAccessContentProps = {
  name: 'address-book' | 'notes' | 'tasks' | 'calendar' | ''
}

const FastAccessContent: React.FC<FastAccessContentProps> = ({ name }) => {
  let ContentComponent = null

  if (name === 'address-book') {
    ContentComponent = <AddressBookContent />
  } else if (name === 'notes') {
    ContentComponent = <NotesContent />
  } else if (name === 'tasks') {
    ContentComponent = <TasksContent />
  } else if (name === 'calendar') {
    ContentComponent = <CalendarContent />
  }

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
