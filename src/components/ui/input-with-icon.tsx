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
        size={'icon'}
        variant="ghost"
        className="absolute right-0 top-0"
        onClick={onActionClick}
      >
        {ActionComponent}
      </Button>
    </div>
  )
}

export { InputWithIcon }
