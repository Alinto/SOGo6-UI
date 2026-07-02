'use client'

import type { ReactNode } from 'react'
import {
  SettingsPageHeader,
  SettingsPageShell,
} from './settings-page-layout'

export function getQueryErrorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status: number }).status
  }
  return undefined
}

interface SettingsAsyncPageProps {
  title: string
  description?: string
  error: unknown
  isLoading: boolean
  featureDisabledMessage: string
  loadFailedMessage: string
  skeleton: ReactNode
  children: ReactNode
}

export function SettingsAsyncPage({
  title,
  description,
  error,
  isLoading,
  featureDisabledMessage,
  loadFailedMessage,
  skeleton,
  children,
}: SettingsAsyncPageProps) {
  const header = (
    <SettingsPageHeader title={title} description={description} />
  )

  if (error) {
    const message =
      getQueryErrorStatus(error) === 403
        ? featureDisabledMessage
        : loadFailedMessage

    return (
      <SettingsPageShell>
        {header}
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {message}
        </div>
      </SettingsPageShell>
    )
  }

  return (
    <SettingsPageShell>
      {header}
      {isLoading ? skeleton : children}
    </SettingsPageShell>
  )
}
