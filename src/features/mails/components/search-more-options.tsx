import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import React from 'react'

const SearchMoreOptions: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" className="w-full" />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" className="w-full" />
        </div>
        <div>
          <Label htmlFor="bcc">Bcc</Label>
          <Input id="bcc" className="w-full" />
        </div>
        {/* <div>
        <Label htmlFor="contains">Contains</Label>
        <Input id="contains" className="w-full" />
      </div>
      <div>
        <Label htmlFor="not-contains">Does not contain</Label>
        <Input id="not-contains" className="w-full" />
      </div> */}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" className="w-full" />
        </div>
        <div>
          <Label htmlFor="body">Body</Label>
          <Input id="body" className="w-full" />
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="with-attachments" />
          <Label htmlFor="with-attachments">With Attachments</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="unread" />
          <Label htmlFor="unread">In favorites</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="unread" />
          <Label htmlFor="unread">Unseen only</Label>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="from">Date from</Label>
          <Input id="from" className="w-full" />
        </div>
        <div>
          <Label htmlFor="from">Date to</Label>
          <Input id="from" className="w-full" />
        </div>
      </div>
    </>
  )
}

export default SearchMoreOptions
