'use client'

import { Button } from '@/components/ui/button'
import { FormDescription, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CustomEditorCore } from '@/features/mails/components/compose/editor-core'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, ReactNode, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { IdentityFields } from './identity-fields'

interface IdentityCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  index: number
  identityCount: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSetDefault: () => void
  onRemove: () => void
  translationNamespace?: string
  showRemoveButton?: boolean
  showDefaultBadge?: boolean
  disableFields?: {
    name?: boolean
    mail?: boolean
    replyTo?: boolean
    isDefault?: boolean
  }
  readOnlyFields?: {
    mail?: boolean
  }
  fieldLabels?: {
    name?: string
    email?: string
    replyTo?: string
    isDefault?: string
    isDefaultDescription?: string
  }
  fieldDescriptions?: {
    name?: string
    email?: string
    replyTo?: string
  }
  children?: ReactNode
  headerClassName?: string
  contentClassName?: string
  cardClassName?: string
  removeButtonTooltip?: string
  removeButtonDisabledTooltip?: string
  getInitials?: (name: string, fallback?: string) => string
  primaryBadgeClassName?: string
  t?: (key: string) => string
}

/**
 * IdentityCard - Reusable card component for displaying and editing identities
 *
 * Features:
 * - Collapsible card with header showing identity preview (initials, name, email)
 * - Built-in identity fields form section
 * - Customizable default badge and remove button
 * - Support for custom content (e.g., signatures) through children
 * - Configurable styling and labels
 * - Flexible field disabling and read-only settings
 */
export const IdentityCard = memo(function IdentityCard({
  form,
  index,
  identityCount,
  isCollapsed,
  onToggleCollapse,
  onSetDefault,
  onRemove,
  translationNamespace = 'IDENTITY_COMPONENT',
  showRemoveButton = true,
  showDefaultBadge = true,
  disableFields = {},
  readOnlyFields = {},
  fieldLabels = {},
  fieldDescriptions = {},
  children,
  headerClassName,
  contentClassName,
  cardClassName,
  removeButtonTooltip,
  removeButtonDisabledTooltip,
  getInitials: customGetInitials,
  primaryBadgeClassName,
  t: tProp,
}: IdentityCardProps) {
  const identityName = form.watch(`identities.${index}.name`) as string

  const identityMail = form.watch(`identities.${index}.mail`) as string

  const isDefault = form.watch(`identities.${index}.isDefault`) as boolean

  // Use custom getInitials function if provided, otherwise use default
  const getInitials = customGetInitials
    ? customGetInitials
    : (name: string, fallback = '?') => {
        return (name || fallback)
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      }

  const initials = getInitials(identityName)

  return (
    <div
      className={cn(
        'border-border overflow-hidden rounded-md border',
        cardClassName
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'bg-muted/50 flex items-center justify-between px-4 py-3',
          headerClassName
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {identityName ||
                (tProp ? tProp('labels.newIdentity') : 'New Identity')}
            </span>
            <span className="text-muted-foreground text-xs">
              {identityMail || '—'}
            </span>
          </div>
          {showDefaultBadge && isDefault && (
            <span
              className={cn(
                'bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium',
                primaryBadgeClassName
              )}
            >
              {tProp ? tProp('labels.default') : 'Default'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
          {showRemoveButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRemove}
              disabled={identityCount === 1}
              title={
                identityCount === 1
                  ? removeButtonDisabledTooltip ||
                    (tProp ? tProp('labels.atLeastOneIdentity') : undefined)
                  : removeButtonTooltip ||
                    (tProp ? tProp('labels.removeIdentity') : undefined)
              }
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div
          className={cn(
            'border-border space-y-4 border-t px-4 py-4',
            contentClassName
          )}
        >
          <IdentityFields
            form={form}
            index={index}
            identityCount={identityCount}
            onSetDefault={onSetDefault}
            translationNamespace={translationNamespace}
            disableFields={disableFields}
            readOnlyFields={readOnlyFields}
            fieldLabels={fieldLabels}
            fieldDescriptions={fieldDescriptions}
          />
          {children}
        </div>
      )}
    </div>
  )
})

IdentityCard.displayName = 'IdentityCard'

/**
 * SignaturesSection - Manages signatures for an identity
 * Used as a child component within IdentityCard
 */
export function SignaturesSection({
  form,
  identityIndex,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  identityIndex: number
}) {
  const t = useTranslations('IDENTITY_COMPONENT')
  const [collapsedSignatures, setCollapsedSignatures] = useState<
    Record<string, boolean>
  >({})
  const [newSignatureName, setNewSignatureName] = useState('')

  const signatures = form.watch(`identities.${identityIndex}.signatures`) || {}

  const handleAddSignature = () => {
    const trimmed = newSignatureName.trim()
    if (!trimmed || trimmed in signatures) return

    form.setValue(
      `identities.${identityIndex}.signatures`,
      { ...signatures, [trimmed]: '' },
      { shouldDirty: true }
    )
    setNewSignatureName('')
  }

  const handleRemoveSignature = (name: string) => {
    const updated = { ...signatures }
    delete updated[name]
    form.setValue(`identities.${identityIndex}.signatures`, updated, {
      shouldDirty: true,
    })
  }

  const toggleCollapse = (name: string) => {
    setCollapsedSignatures((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div>
        <FormLabel>{t('labels.signatures')}</FormLabel>
        <FormDescription>
          {t('labels.signaturesDescription')}
        </FormDescription>
      </div>

      {/* Existing Signatures */}
      {Object.entries(signatures).length > 0 && (
        <div className="space-y-2">
          {Object.entries(signatures).map(([name, content]) => (
            <div
              key={name}
              className="border-border overflow-hidden rounded-lg border"
            >
              <div
                className="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center justify-between p-2"
                onClick={() => toggleCollapse(name)}
              >
                <span className="text-sm font-medium">{name}</span>
                <div className="flex items-center gap-1">
                  {collapsedSignatures[name] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveSignature(name)
                    }}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </div>
              {!collapsedSignatures[name] && (
                <div className="border-t p-3">
                  <CustomEditorCore
                    data={content as string}
                    onChange={(value) => {
                      form.setValue(
                        `identities.${identityIndex}.signatures.${name}`,
                        value,
                        { shouldDirty: true }
                      )
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Signature */}
      <div className="mt-2 flex gap-2">
        <Input
          value={newSignatureName}
          onChange={(e) => setNewSignatureName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddSignature()
            }
          }}
          placeholder={t('labels.signaturePlaceholder')}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSignature}
          disabled={!newSignatureName.trim() || newSignatureName in signatures}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
