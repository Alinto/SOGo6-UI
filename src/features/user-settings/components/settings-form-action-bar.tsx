'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { memo } from 'react'

interface SettingsFormActionBarProps {
  onReset: () => void
  disableReset: boolean
  disableSubmit: boolean
  resetLabel: string
  submitLabel: string
  hint?: string
  isLoading?: boolean
  visible?: boolean
}

const SettingsFormActionBar = memo(function SettingsFormActionBar({
  onReset,
  disableReset,
  disableSubmit,
  resetLabel,
  submitLabel,
  hint,
  isLoading = false,
  visible = true,
}: SettingsFormActionBarProps) {
  if (!visible) return null

  return (
    <div
      className={cn(
        'bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-10 -mx-4 border-t px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {hint ? (
          <p className="text-muted-foreground text-sm">{hint}</p>
        ) : (
          <span className="hidden sm:block" />
        )}
        <div className="flex gap-2 sm:ml-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disableReset || isLoading}
            onClick={onReset}
          >
            {resetLabel}
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={disableSubmit || isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
})

export default SettingsFormActionBar
