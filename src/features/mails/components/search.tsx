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
import { useTranslations } from 'next-intl'
import SearchFolders from './search-folders'
import SearchMoreOptions from './search-more-options'

export function Search() {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('MAILS_COMMONS')
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            className="placeholder:text-transparent"
            placeholder={t('search.placeholder.string')}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm text-gray-500">
            {t('search.placeholder.string')}
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
              <Label htmlFor="bodySearch">
                {t('search.in_message_content.string')}
              </Label>
              <Checkbox id="bodySearch" />
            </div>
            <div className="">
              <Label>{t('search.folders.string')}</Label>
              <div>
                <Button className="mr-2" variant={'outline'}>
                  {t('search.folders.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.inbox.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.drafts.string')}
                </Button>
                <Button className="mr-2" variant={'outline'}>
                  {t('folders.sent.string')}
                </Button>
                <SearchFolders />
              </div>
            </div>
          </div>
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline">
                {t('search.more_options.string')}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="scrollbar-thin-gray max-h-[40vh] overflow-y-auto pr-2">
              <SearchMoreOptions />
            </CollapsibleContent>
          </Collapsible>
          <Separator className="my-1" />

          <div className="flex items-center justify-end">
            <div>
              <Button>{formT('reset.default.string')}</Button>
              <Button className="ml-2">{t('search.confirm.string')}</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
