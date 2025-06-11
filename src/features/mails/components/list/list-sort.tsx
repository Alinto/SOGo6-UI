import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DynamicIcon } from 'lucide-react/dynamic'
import { useSearchParams } from 'next/navigation'
import React from 'react'

import { useRouter } from '@/lib/i18n/navigation'
import type { IconName } from 'lucide-react/dynamic'
import { useTranslations } from 'next-intl'

const sortList: { label: string; value: string; icon: IconName }[] = [
  {
    label: 'list.sort.date.ascending.string',
    value: 't_asc',
    icon: 'clock-arrow-down',
  },
  {
    label: 'list.sort.date.descending.string',
    value: 't_desc',
    icon: 'clock-arrow-up',
  },
  {
    label: 'list.sort.size.ascending.string',
    value: 's_asc',
    icon: 'arrow-down-narrow-wide',
  },
  {
    label: 'list.sort.size.descending.string',
    value: 's_desc',
    icon: 'arrow-down-wide-narrow',
  },
]

const ListSort: React.FC = () => {
  const { push } = useRouter()
  const params = useSearchParams()
  const t = useTranslations('Mails_Common')
  const sort = params.get('sort') || 't_asc'

  const onSortChange = (value: string) => {
    const newParams = new URLSearchParams(params.toString())
    if (value === 't_asc') {
      newParams.delete('sort')
    } else {
      newParams.set('sort', value)
    }
    const newUrl = `?${newParams.toString()}`
    push(newUrl)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={'sm'}>
          <DynamicIcon
            name={
              sortList.find((s) => s.value === sort)?.icon ?? 'clock-arrow-down'
            }
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 max-h-60 w-auto overflow-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent',
          scrollbarGutter: 'stable',
        }}
      >
        <DropdownMenuGroup>
          {sortList.map((sort) => (
            <DropdownMenuItem
              key={sort.value}
              className="cursor-pointer"
              onClick={() => onSortChange(sort.value)}
            >
              <DynamicIcon name={sort.icon} className="mr-2 h-4 w-4" />
              {t(sort.label)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ListSort
