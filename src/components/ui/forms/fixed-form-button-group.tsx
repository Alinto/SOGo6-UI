import { cn } from '@/lib/utils'
import { AccessibleIcon } from '@radix-ui/react-accessible-icon'
import { AlertTriangle, Loader2, Save, Undo } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { FieldErrors, FieldValues } from 'react-hook-form'
import { Button } from '../button'

interface FixedFormButtonGroupProps {
  onReset: () => void
  disableReset: boolean
  disableSubmit: boolean
  resetLabel?: string
  submitLabel?: string
  isLoading?: boolean
  errors?: FieldErrors<FieldValues>

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
  errors,
  mode = 'floating',
}) => {
  const isInline = mode === 'inline'
  const hasErrors = errors && Object.keys(errors).length > 0
  const t = useTranslations('COMPONENTS')

  return (
    <div
      className={cn(
        'flex gap-4 pt-6',
        isInline
          ? 'justify-end sm:justify-start'
          : 'fixed right-3 bottom-20 justify-end'
      )}
    >
      <Button
        className={cn(
          'shadow-lg',
          isInline ? 'gap-2 rounded-lg px-6 py-3' : 'h-14 w-14 rounded-full'
        )}
        size={isInline ? 'default' : 'icon'}
        type="button"
        disabled={disableReset || isLoading}
        onClick={onReset}
        variant="outline"
      >
        <Undo size={isInline ? 18 : 24} />
        {isInline && <span>{resetLabel}</span>}
        {!isInline && (
          <AccessibleIcon label={resetLabel}>
            <span className="sr-only">{resetLabel}</span>
          </AccessibleIcon>
        )}
      </Button>

      <div className="relative">
        {hasErrors && (
          <div
            className="bg-background absolute -top-1 -right-1 z-10 rounded-full p-0.5"
            title={t('forms.fixed-form-button-group.alert', {
              number: Object.keys(errors).length,
            })}
          >
            <AlertTriangle className="text-warning h-4 w-4" />
          </div>
        )}
        <Button
          className={cn(
            'shadow-lg',
            isInline ? 'gap-2 rounded-lg px-6 py-3' : 'h-14 w-14 rounded-full'
          )}
          size={isInline ? 'default' : 'icon'}
          type="submit"
          disabled={disableSubmit || isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <Loader2 size={isInline ? 18 : 24} className="animate-spin" />
          ) : (
            <Save size={isInline ? 18 : 24} />
          )}
          {isInline && <span>{submitLabel}</span>}
          {!isInline && (
            <AccessibleIcon label={submitLabel}>
              <span className="sr-only">{submitLabel}</span>
            </AccessibleIcon>
          )}
        </Button>
      </div>
    </div>
  )
}

export default FixedFormButtonGroup
