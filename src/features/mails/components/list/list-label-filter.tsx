'use client'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MailCategoryList } from '@/features/mails/components/mail/mail-category-picker-fields'
import { useMailLabelOptions } from '@/features/mails/hooks/use-mail-label-options'
import { useMailListLabelFilter } from '@/features/mails/hooks/use-mail-list-label-filter'
import { tagColor } from '@/features/mails/utils/searchable-mail-tags'
import { cn } from '@/lib/utils'
import { Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { memo, useMemo, useState } from 'react'

interface ListLabelFilterProps {
  /** Icon-only trigger, for the narrow toolbar. */
  compact?: boolean
}

/**
 * Label quick filter of the mail list: shows the mails having every chosen
 * label (`match:all`), combined with the read / unread / important filter.
 * The labels live in the URL (`?label=A&label=B`); the labels of an active
 * `match:all` search are shown as chosen too (see useMailListLabelFilter).
 */
function ListLabelFilter({ compact = false }: ListLabelFilterProps) {
  const t = useTranslations('MAILS_LIST')
  const { account } = useParams()
  const accountId = Array.isArray(account) ? account[0] : (account ?? '0')
  const [open, setOpen] = useState(false)

  const {
    labels: activeLabels,
    toggle: handleToggle,
    clear,
  } = useMailListLabelFilter()
  const { labels, isFetching } = useMailLabelOptions(accountId, open)

  // Active labels matching no option (a name typed in the search bar that no
  // mail or category has) are listed too, so they can be unchecked.
  const categories = useMemo(() => {
    const known = new Set(labels.map((label) => label.name.toLowerCase()))
    const unknown = activeLabels
      .filter((name) => !known.has(name.toLowerCase()))
      .map((name) => ({ name, color: null, is_default: false }))
    return [...labels, ...unknown].map((label) => ({
      ...label,
      color: tagColor(label),
    }))
  }, [labels, activeLabels])
  // A label typed in a search (`label:work`) checks the option "Work".
  const selected = useMemo(() => {
    const active = new Set(activeLabels.map((l) => l.toLowerCase()))
    return new Set(
      categories
        .map((category) => category.name)
        .filter((name) => active.has(name.toLowerCase()))
    )
  }, [activeLabels, categories])

  const count = activeLabels.length
  const label = t('filter.labels.label.string')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={compact ? 'icon' : 'sm'}
          aria-label={label}
          data-active={count > 0}
          className={cn(
            'relative shrink-0 cursor-pointer gap-2 font-normal',
            count > 0 && 'bg-accent text-accent-foreground'
          )}
        >
          <Tag size={16} aria-hidden="true" />
          {!compact && <span>{label}</span>}
          {count > 0 && (
            <span
              data-testid="list-label-filter-count"
              className={cn(
                'bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none',
                compact && 'absolute -top-1 -right-1'
              )}
            >
              {count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-2">
        <MailCategoryList
          allCategories={categories}
          selected={selected}
          onToggle={handleToggle}
          busy={isFetching && categories.length === 0}
        />
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full cursor-pointer"
            onClick={clear}
          >
            {t('filter.labels.clear.string')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default memo(ListLabelFilter)
