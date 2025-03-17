import { FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import React from 'react'

interface RadioGroupFormProps {
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
  value: string
  disabled?: boolean
  horizontal?: boolean
}

const RadioGroupForm: React.FC<RadioGroupFormProps> = ({
  options,
  onValueChange,
  value,
  disabled,
  horizontal = false,
}) => {
  return (
    <RadioGroup
      className={cn(horizontal ? 'flex-row' : 'flex-col', 'flex gap-4')}
      onValueChange={onValueChange}
      defaultValue={value}
    >
      {options.map((option) => (
        <FormItem
          key={option.value}
          className="flex items-center space-x-3 space-y-0"
        >
          <FormControl>
            <RadioGroupItem disabled={disabled} value={option.value} />
          </FormControl>
          <FormLabel>{option.label}</FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  )
}

export default RadioGroupForm
