'use client'

import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { memo, type ReactNode } from 'react'

/** Dark red on white: the login panel is `bg-primary` (dark teal) in both themes, so `text-destructive` disappears on it. */
export const loginFieldErrorClassName =
  'w-fit max-w-full rounded-md bg-white px-2 py-1 text-sm font-medium text-red-900'

export const loginInvalidControlClassName =
  'border-red-100 focus-visible:ring-red-100'

function LoginErrorNotice({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2 rounded-lg border border-red-200 bg-white p-3 text-sm font-medium text-red-900',
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  )
}

export default memo(LoginErrorNotice)
