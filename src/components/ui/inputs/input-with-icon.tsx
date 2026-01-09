import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import React from 'react'

const InputWithIcon = (
  props: React.ComponentPropsWithoutRef<'input'> & {
    onActionClick?: () => void
    ActionComponent: React.ReactElement
  }
) => {
  const { onActionClick, ActionComponent, ...inputProps } = props
  return (
    <div className="relative">
      <Input role="textbox" {...inputProps} />
      <Button
        type="button"
        variant="ghost"
        className="hover:text-foreground absolute top-1/2 right-0 h-9 w-9 -translate-y-1/2 rounded-md hover:bg-transparent focus-visible:ring-0"
        onClick={onActionClick}
      >
        {ActionComponent}
      </Button>
    </div>
  )
}

export { InputWithIcon }
