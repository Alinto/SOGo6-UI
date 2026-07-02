'use client'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { memo, type ReactNode } from 'react'

interface SettingsPageShellProps {
  children: ReactNode
  className?: string
}

export const SettingsPageShell = memo(function SettingsPageShell({
  children,
  className,
}: SettingsPageShellProps) {
  return (
    <div
      className={cn('w-full space-y-6 px-4 py-6', className)}
    >
      {children}
    </div>
  )
})

interface SettingsPageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export const SettingsPageHeader = memo(function SettingsPageHeader({
  title,
  description,
  actions,
  className,
}: SettingsPageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <Separator />
    </div>
  )
})
