import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import SearchFolders from './search-folders'
import SearchMoreOptions from './search-more-options'

export function Search() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            className="placeholder:text-transparent"
            placeholder="Search in your messages."
          />
          <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-gray-500">
            Search in your messages.
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="absolute z-50 py-2"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <div className="grid gap-4">
          <Input />
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bodySearch">Search in the message content</Label>
              <Checkbox id="bodySearch" />
            </div>
            <div className="">
              <Label>Search in</Label>
              <div>
                <Button className="mr-2" variant={'outline'}>
                  All folders
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  Inbox
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  Draft
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  Sent
                </Button>
                <SearchFolders />
              </div>
            </div>
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">More options</Button>
            </CollapsibleTrigger>
            <CollapsibleContent
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db transparent',
                scrollbarGutter: 'stable',
              }}
              className="max-h-[40vh] overflow-y-auto pr-2"
            >
              <SearchMoreOptions />
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-1" />

          <div className="flex items-center justify-end">
            <div>
              <Button>Reset</Button>
              <Button className="ml-2">Search</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
