'use client'

import { Button } from '@/components/ui/button'
import { useModuleCreateAction } from '@/hooks/use-module-create-action'
import { cn } from '@/lib/utils'
import { memo } from 'react'

function MobileCreateFab() {
  const action = useModuleCreateAction()

  if (!action) {
    return null
  }

  const Icon = action.icon

  return (
    <Button
      type="button"
      size="icon"
      data-testid="mobile-create-fab"
      aria-label={action.label}
      onClick={action.onClick}
      className={cn(
        'fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg md:hidden',
        '[&_svg]:size-6'
      )}
    >
      <Icon aria-hidden />
    </Button>
  )
}

export default memo(MobileCreateFab)
