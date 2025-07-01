import { SidebarGroupContent } from '@/components/ui/sidebar'
import React from 'react'

const AddressBookContent: React.FC = () => {
  return (
    <SidebarGroupContent>
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 10:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with John Doe
        </span>
      </div>
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 10:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with Filipe Doe
        </span>
      </div>
      <div className="m-2 mt-4 flex flex-col items-center rounded-lg border-1 p-2 shadow-md">
        <div className="text-muted-foreground">2023-10-01 15:00 AM</div>
        <span className="text-muted-foreground text-xs">
          Appointment with Jane Doe
        </span>
      </div>
    </SidebarGroupContent>
  )
}

export default AddressBookContent
