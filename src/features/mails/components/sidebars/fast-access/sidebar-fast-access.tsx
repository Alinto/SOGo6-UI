import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  Calendar1Icon,
  ClipboardList,
  Contact2,
  NotebookText,
} from 'lucide-react'
import React from 'react'

const items = [
  {
    title: 'Address Book',
    icon: Contact2,
    name: 'address-book',
  },
  {
    title: 'Calendar',
    icon: Calendar1Icon,
    name: 'calendar',
  },
  {
    title: 'Tasks',
    icon: ClipboardList,
    name: 'tasks',
  },
  {
    title: 'Notes',
    icon: NotebookText,
    name: 'notes',
  },
]

interface SidebarFastAccessProps {
  handleOpen: (_name: string) => void
}

const SidebarFastAccess: React.FC<SidebarFastAccessProps> = ({
  handleOpen,
}) => {
  return (
    <Sidebar
      className={`text-accent bg-sidebar-background-secondary mt-12 border-0`}
      side="right"
    >
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mt-4 align-middle">
                  <SidebarMenuButton onClick={() => handleOpen(item.name)}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default SidebarFastAccess
