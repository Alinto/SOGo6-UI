import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Edit, GripVertical, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useState } from 'react'
import { type Control, type FieldArrayWithId, useWatch } from 'react-hook-form'
import type { FiltersFormValues } from './filters-schema'

interface FilterLineFormProps {
  field: FieldArrayWithId<FiltersFormValues, 'filters', 'fieldKey'>
  index: number
  control: Control<FiltersFormValues>
  onEdit: () => void
  onDelete: () => void
  attributes?: Record<string, unknown>
  listeners?: Record<string, unknown>
}

const FilterLineForm: React.FC<FilterLineFormProps> = ({
  index,
  control,
  onEdit,
  onDelete,
  attributes,
  listeners,
}) => {
  const t = useTranslations('US_MAIL_FILTERS')
  const [grabbing, setGrabbing] = useState(false)
  const enabled = useWatch({ control, name: `filters.${index}.enabled` })
  const filterName = useWatch({ control, name: `filters.${index}.name` })
  const advancedStructure = useWatch({
    control,
    name: `filters.${index}.advancedStructure`,
  })
  const readOnly = useWatch({ control, name: `filters.${index}.readOnly` })

  return (
    <div
      className={cn(
        'group bg-card flex items-center gap-2 rounded-lg border px-2 py-2 transition-colors sm:gap-3 sm:px-3',
        enabled
          ? 'border-border hover:border-border/80'
          : 'border-border/60 bg-muted/20 opacity-80'
      )}
    >
      <button
        type="button"
        className={cn(
          'text-muted-foreground hover:text-foreground shrink-0 cursor-grab touch-none rounded p-1 transition-colors',
          grabbing && 'text-foreground cursor-grabbing'
        )}
        aria-label={t('list.drag_handle.string')}
        onMouseDown={() => setGrabbing(true)}
        onMouseUp={() => setGrabbing(false)}
        onMouseLeave={() => setGrabbing(false)}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <FormField
        control={control}
        name={`filters.${index}.enabled`}
        render={({ field: toggleField }) => (
          <FormItem className="flex shrink-0 items-center space-y-0">
            <FormControl>
              <Switch
                checked={toggleField.value}
                onCheckedChange={toggleField.onChange}
                aria-label={t('aria.toggle_filter.string')}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`filters.${index}.name`}
        render={({ field: nameField }) => (
          <FormItem className="flex min-w-0 flex-1 items-center space-y-0">
            <FormControl>
              <Input
                {...nameField}
                readOnly={Boolean(readOnly)}
                className="h-8 border-0 bg-transparent px-0 font-medium shadow-none focus-visible:ring-0"
              />
            </FormControl>
          </FormItem>
        )}
      />

      {(advancedStructure || readOnly) && (
        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
          {advancedStructure
            ? t('list.advanced_structure.string')
            : t('list.read_only.string')}
        </Badge>
      )}

      <div className="flex shrink-0 items-center opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground h-8 w-8"
          onClick={onEdit}
          aria-label={t('form.edit.string', { name: filterName || '' })}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive h-8 w-8"
          onClick={onDelete}
          aria-label={t('list.delete_confirm.confirm.string')}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default memo(FilterLineForm)
