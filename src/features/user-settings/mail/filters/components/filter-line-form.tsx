import { Button } from '@/components/ui/button'
import CheckboxToggle from '@/components/ui/checkbox-toggle'
import { FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { DynamicIcon } from 'lucide-react/dynamic'
import React from 'react'
import { type Control, type FieldArrayWithId } from 'react-hook-form'
import FilterForm from './filter-form'

interface FilterLineFormProps {
  field: FieldArrayWithId<{
    enabled: boolean
    id: string
    name: string
    operator: string
    rules: FieldArrayWithId<{
      id: string
      field: string
      field_value: string
      condition: string
      value: string
    }>[]
    actions: FieldArrayWithId<{
      id: string
      action: string
      value: string
    }>[]
  }>
  index: number
  control: Control
  remove: (index: number) => void
  attributes?: Record<string, any>
  listeners?: Record<string, any>
}

const FilterLineForm: React.FC<FilterLineFormProps> = ({
  field,
  index,
  control,
  remove,
  attributes,
  listeners,
}) => {
  const [grabbing, setGrabbing] = React.useState(false)

  return (
    <div key={field.id} className="flex items-center gap-4">
      <DynamicIcon
        onMouseDown={() => setGrabbing(true)}
        onMouseUp={() => setGrabbing(false)}
        name={grabbing ? 'arrow-down-up' : 'separator-horizontal'}
        {...attributes}
        {...listeners}
      />
      <FormField
        control={control}
        name={`filters.${index}.enabled`}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-y-0 space-x-3 p-4">
            <FormControl>
              <CheckboxToggle
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`filters.${index}.name`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FilterForm filter={field} />
      <Button type="button" size={'icon'} variant="outline">
        <Trash2 className="text-primary" onClick={() => remove(index)} />
      </Button>
    </div>
  )
}

export default FilterLineForm
