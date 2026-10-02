'use client'

import { CreateActionsMenu } from '@/components/sidebar/module-create-split-button'
import { Button } from '@/components/ui/button'
import { useProfile } from '@/features/user-profile'
import { createModuleFromPathname } from '@/hooks/create-module-from-pathname'
import { useCrossModuleCreateActions } from '@/hooks/use-cross-module-create-actions'
import { useModuleCreateAction } from '@/hooks/use-module-create-action'
import { usePathname } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { memo } from 'react'

function MobileCreateFab() {
  const pathname = usePathname()
  const { moduleAccess, isLoading } = useProfile()
  const moduleId = createModuleFromPathname(pathname, moduleAccess, isLoading)
  const visibleAction = useModuleCreateAction()
  const { others } = useCrossModuleCreateActions(moduleId)

  if (!visibleAction) {
    return null
  }

  const Icon = visibleAction.icon
  const hasMenu = others.length > 0

  if (!hasMenu) {
    return (
      <Button
        type="button"
        size="icon"
        data-testid="mobile-create-fab"
        aria-label={visibleAction.label}
        onClick={visibleAction.onClick}
        className={cn(
          'fixed right-4 bottom-20 z-40 h-14 w-14 rounded-full shadow-lg md:hidden',
          '[&_svg]:size-6'
        )}
      >
        <Icon aria-hidden />
      </Button>
    )
  }

  return (
    <div className="bg-primary fixed right-4 bottom-20 z-40 flex h-14 items-stretch overflow-hidden rounded-full shadow-lg md:hidden">
      <Button
        type="button"
        size="icon"
        data-testid="mobile-create-fab"
        aria-label={visibleAction.label}
        onClick={visibleAction.onClick}
        className="h-14 w-14 rounded-none shadow-none [&_svg]:size-6"
      >
        <Icon aria-hidden />
      </Button>
      <span aria-hidden className="bg-primary-foreground/20 my-3 w-px" />
      <CreateActionsMenu
        actions={others}
        side="top"
        triggerClassName="text-primary-foreground hover:bg-primary-foreground/10 flex w-11 items-center justify-center"
      />
    </div>
  )
}

export default memo(MobileCreateFab)
