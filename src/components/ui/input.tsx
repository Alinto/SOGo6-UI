import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

import { Label } from '@/components/ui/label'

interface InputWithLabelProps extends React.ComponentProps<'input'> {
  label: string
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  label,
  ...inputProps
}) => {
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor={inputProps.id}>{label}</Label>
      <Input {...inputProps} />
    </div>
  )
}

InputWithLabel.displayName = 'InputWithLabel'

export { Input, InputWithLabel }
