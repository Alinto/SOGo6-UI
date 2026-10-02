'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '@/components/ui/sidebar'
import {
  useCrossModuleCreateActions,
  type CreateModuleId,
  type CrossModuleCreateAction,
} from '@/hooks/use-cross-module-create-actions'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo } from 'react'

const collapsedButtonClassName =
  'bg-sidebar-foreground text-sidebar hover:bg-sidebar-foreground/90 hover:text-sidebar h-10 justify-center gap-2 rounded-lg border-2 border-transparent text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-none'

interface ModuleCreateSplitButtonProps {
  primary: CreateModuleId
}

interface CreateActionsMenuProps {
  actions: CrossModuleCreateAction[]
  side?: 'bottom' | 'top'
  triggerClassName?: string
}

export function CreateActionsMenu({
  actions,
  side = 'bottom',
  triggerClassName,
}: CreateActionsMenuProps) {
  const t = useTranslations('COMMON')

  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t('create_menu.aria_label.string')}
          className={cn(
            'focus-visible:ring-sidebar-ring cursor-pointer outline-hidden focus-visible:ring-2 data-[state=open]:[&_svg]:rotate-180',
            triggerClassName
          )}
        >
          <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={action.id}
              disabled={action.disabled}
              onSelect={() => {
                action.onClick()
              }}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ModuleCreateSplitButton({
  primary: primaryId,
}: ModuleCreateSplitButtonProps) {
  const { state } = useSidebar()
  const { primary, others } = useCrossModuleCreateActions(primaryId)

  if (!primary) return null

  const Icon = primary.icon

  if (state === 'collapsed') {
    return (
      <SidebarMenuButton
        onClick={primary.onClick}
        disabled={primary.disabled}
        tooltip={primary.label}
        className={collapsedButtonClassName}
      >
        <span className="sr-only">{primary.label}</span>
        <Icon className="h-4 w-4 shrink-0 transition-transform" />
        <span className="truncate group-data-[collapsible=icon]:hidden">
          {primary.label}
        </span>
      </SidebarMenuButton>
    )
  }

  return (
    <div
      role="group"
      className="bg-sidebar-foreground text-sidebar flex h-10 w-full items-stretch overflow-hidden rounded-lg border-2 border-transparent text-sm"
    >
      <button
        type="button"
        disabled={primary.disabled}
        onClick={primary.onClick}
        className="hover:bg-sidebar-foreground/90 focus-visible:ring-sidebar-ring flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="sr-only">{primary.label}</span>
        <Icon className="h-4 w-4 shrink-0 transition-transform" />
        <span className="truncate">{primary.label}</span>
      </button>
      {others.length > 0 ? (
        <>
          <span aria-hidden className="bg-sidebar/20 my-2 w-px shrink-0" />
          <CreateActionsMenu
            actions={others}
            triggerClassName="hover:bg-sidebar-foreground/90 flex w-9 shrink-0 items-center justify-center"
          />
        </>
      ) : null}
    </div>
  )
}

export default memo(ModuleCreateSplitButton)
