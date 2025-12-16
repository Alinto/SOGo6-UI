import { cn } from '@/lib/utils'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { Loader2, Save, Undo } from 'lucide-react'
import React from 'react'
import { Button } from '../button'

interface FixedFormButtonGroupProps {
  onReset: () => void
  disableReset: boolean
  disableSubmit: boolean
  resetLabel?: string
  submitLabel?: string
  isLoading?: boolean

  /**
   * Preset modes:
   * - 'floating': Round buttons fixed bottom-right (for long forms)
   * - 'inline': Rectangular buttons with labels below form (for short forms)
   * @default 'floating'
   */
  mode?: 'floating' | 'inline'
}

const FixedFormButtonGroup: React.FC<FixedFormButtonGroupProps> = ({
  onReset,
  disableReset,
  disableSubmit,
  resetLabel = 'Reset',
  submitLabel = 'Save',
  isLoading = false,
  mode = 'floating',
}) => {
  const isInline = mode === 'inline'

  return (
    <div
      className={cn(
        'flex gap-4 pt-6',
        isInline
          ? 'justify-end sm:justify-start'
          : 'fixed right-12 bottom-20 justify-end'
      )}
    >
      <Button
        className={cn(
          'shadow-lg',
          isInline ? 'gap-2 rounded-lg px-6 py-3' : 'rounded-full p-7'
        )}
        size={isInline ? 'default' : 'icon'}
        type="button"
        disabled={disableReset || isLoading}
        onClick={onReset}
        variant="outline"
      >
        <Undo size={isInline ? 18 : 40} />
        {isInline && <span>{resetLabel}</span>}
        {!isInline && (
          <AccessibleIcon label={resetLabel}>
            <span className="sr-only">{resetLabel}</span>
          </AccessibleIcon>
        )}
      </Button>

      <Button
        className={cn(
          'shadow-lg',
          isInline ? 'gap-2 rounded-lg px-6 py-3' : 'rounded-full p-7'
        )}
        size={isInline ? 'default' : 'icon'}
        type="submit"
        disabled={disableSubmit || isLoading}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <Loader2 size={isInline ? 18 : 40} className="animate-spin" />
        ) : (
          <Save size={isInline ? 18 : 40} />
        )}
        {isInline && <span>{submitLabel}</span>}
        {!isInline && (
          <AccessibleIcon label={submitLabel}>
            <span className="sr-only">{submitLabel}</span>
          </AccessibleIcon>
        )}
      </Button>
    </div>
  )
}

export default FixedFormButtonGroup
