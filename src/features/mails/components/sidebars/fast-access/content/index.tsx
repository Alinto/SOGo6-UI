import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import React from 'react'
import AddressBookContent from './address-book-content'
import CalendarContent from './calendar-content'
import NotesContent from './notes-content'
import TasksContent from './tasks-content'

type FastAccessContentProps = {
  name: 'address-book' | 'notes' | 'tasks' | 'calendar'
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
      className={`text-sidebar-foreground-secondary bg-sidebar-background-secondary mt-[48px] mr-[2.5rem] border-0`}
      side="right"
    >
      <SidebarContent
        className={`overflow-x-hidden overflow-y-auto border-0`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          scrollbarGutter: 'stable',
        }}
      >
        {ContentComponent}
      </SidebarContent>
    </Sidebar>
  )
}

export default FastAccessContent
