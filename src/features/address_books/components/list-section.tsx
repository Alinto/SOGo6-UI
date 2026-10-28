import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'
import { memo, type MouseEvent } from 'react'
import type { VCard } from '../address-books-types'
import ListItem from './list-item'

type ListSectionProps = {
  title: string
  items: VCard[]
  bookId: string
  contactId?: string
  selectedItems: VCard[]
  showCheckboxes: boolean
  onHandleCheckboxClick: (e: MouseEvent, item: VCard) => void
  className?: string
  variant?: 'lists' | 'contacts'
  allContactsView?: boolean
  sourceBookNamesById?: Record<string, string>
  emptyHint?: string
  onCreate?: () => void
  createLabel?: string
}

function ListSection({
  title,
  items,
  bookId: _bookId,
  contactId,
  selectedItems,
  showCheckboxes,
  onHandleCheckboxClick,
  className,
  variant = 'contacts',
  allContactsView = false,
  sourceBookNamesById,
  emptyHint,
  onCreate,
  createLabel,
}: ListSectionProps) {
  if (items.length === 0 && !emptyHint) return null

  return (
    <section
      className={cn('space-y-2', className)}
      data-testid={`list-section-${variant}`}
    >
      <div className="flex items-center gap-2 px-1">
        {variant === 'lists' && (
          <Users
            className="text-muted-foreground h-3.5 w-3.5 shrink-0"
            aria-hidden
          />
        )}
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          {title}
        </h2>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-start gap-2 px-1 py-2">
          <p className="text-muted-foreground text-xs">{emptyHint}</p>
          {onCreate && createLabel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs"
              onClick={onCreate}
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              {createLabel}
            </Button>
          ) : null}
        </div>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <ListItem
                data={item}
                onHandleCheckboxClick={onHandleCheckboxClick}
                isSelected={selectedItems.some(
                  (selected) => selected.id === item.id
                )}
                isActive={contactId === item.id}
                showCheckbox={showCheckboxes}
                allContactsView={allContactsView}
                sourceBookName={
                  item.addressBookKey
                    ? sourceBookNamesById?.[item.addressBookKey]
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default memo(ListSection)
