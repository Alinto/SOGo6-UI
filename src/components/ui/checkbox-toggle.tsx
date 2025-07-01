import { cn } from '@/lib/utils'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import React from 'react'
import { Checkbox } from './checkbox'

interface CheckboxToggleProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
}
const CheckboxToggle: React.FC<CheckboxToggleProps> = ({ label, ...props }) => {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <Checkbox
        {...props}
        className={cn(
          'peer relative h-6 w-11 rounded-full',
          "after:bg-primary data-[state=checked]:after:bg-secondary data-[state=checked]:after:border-primary after:absolute after:start-[2px] after:top-[1px] after:h-5 after:w-5 after:rounded-full after:border after:transition-all after:content-[''] data-[state=checked]:after:translate-x-full rtl:data-[state=checked]:after:-translate-x-full",
          '[&_svg]:hidden'
        )}
      />
      {label && <span className="ml-3 text-sm">{label}</span>}
    </label>
  )
}

export default CheckboxToggle
