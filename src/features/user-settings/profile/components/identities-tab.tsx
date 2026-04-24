'use client'

import { Button } from '@/components/ui/button'
import {
  IdentityCard,
  SignaturesSection,
} from '@/features/user-settings/components/identity-card'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { ProfileFormData } from '../form/profile-schema'

interface IdentitiesTabProps {
  form: UseFormReturn<ProfileFormData>
  uiConfig?: Record<string, unknown>
}

interface IdentityCardPropsLocal {
  form: UseFormReturn<ProfileFormData>
  index: number
  identityCount: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSetDefault: () => void
  onRemove: () => void
  uiConfig?: Record<string, unknown>
}

// Individual Identity Card Component - Wrapper with config logic
function IdentityCardWithConfig({
  form,
  index,
  identityCount,
  isCollapsed,
  onToggleCollapse,
  onSetDefault,
  onRemove,
  uiConfig,
}: IdentityCardPropsLocal) {
  // Check admin permissions for editing
  const canEditName = !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED
  const canEditMail = !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED
  const canEditReplyTo = !!uiConfig?.SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED
  const isMainIdentity = index === 0

  return (
    <IdentityCard
      form={form}
      index={index}
      identityCount={identityCount}
      isCollapsed={isCollapsed}
      onToggleCollapse={onToggleCollapse}
      onSetDefault={onSetDefault}
      onRemove={onRemove}
      showRemoveButton={!isMainIdentity && identityCount > 1}
      disableFields={{
        name: !canEditName,
        mail: isMainIdentity || !canEditMail,
        replyTo: !canEditReplyTo,
      }}
      readOnlyFields={{
        mail: isMainIdentity && !canEditMail,
      }}
    >
      {/* Signatures */}
      <SignaturesSection form={form} identityIndex={index} />
    </IdentityCard>
  )
}

// Main Identities Tab
export function IdentitiesTab({ form, uiConfig }: IdentitiesTabProps) {
  const t_identities = useTranslations('IDENTITY_COMPONENT')
  const { control, watch } = form
  const [collapsedIdentities, setCollapsedIdentities] = useState<
    Record<number, boolean>
  >({})

  const {
    fields: identityFields,
    append: appendIdentity,
    remove: removeIdentity,
  } = useFieldArray({
    control,
    name: 'identities',
  })

  const identities = watch('identities')
  const hasDefault = identities?.some((id) => id.isDefault)

  // Ensure at least one identity is default
  useEffect(() => {
    if (!hasDefault && identities?.length > 0) {
      form.setValue('identities.0.isDefault', true, { shouldDirty: true })
    }
  }, [hasDefault, identities, form])

  const handleRemoveIdentity = (index: number) => {
    if (identityFields.length <= 1) return
    const wasDefault = identities[index]?.isDefault
    removeIdentity(index)
    if (wasDefault) {
      setTimeout(() => {
        form.setValue('identities.0.isDefault', true, { shouldDirty: true })
      }, 0)
    }
  }

  const handleSetDefault = (index: number) => {
    identityFields.forEach((_, i) => {
      form.setValue(`identities.${i}.isDefault`, i === index, {
        shouldDirty: true,
      })
    })
  }

  const canCreateCustomIdentities = !!uiConfig?.SOGO_D_IDENTITIES_ENABLED

  return (
    <div className="space-y-6">
      {/* Identities List */}
      <div className="space-y-4">
        {identityFields.map((identityField, i) => (
          <IdentityCardWithConfig
            key={identityField.id}
            form={form}
            index={i}
            identityCount={identityFields.length}
            isCollapsed={!!collapsedIdentities[i]}
            onToggleCollapse={() =>
              setCollapsedIdentities((prev) => ({ ...prev, [i]: !prev[i] }))
            }
            onSetDefault={() => handleSetDefault(i)}
            onRemove={() => handleRemoveIdentity(i)}
            uiConfig={uiConfig}
          />
        ))}
      </div>

      {/* Add Identity Button - only if allowed */}
      {canCreateCustomIdentities && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            appendIdentity({
              mail: '',
              name: '',
              replyTo: '',
              isDefault: false,
              signatures: {},
            })
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          {t_identities('labels.addIdentity')}
        </Button>
      )}

      {canCreateCustomIdentities && identityFields.length === 1 && (
        <p className="text-muted-foreground text-center text-sm">
          {t_identities('labels.allowsCustom')}
        </p>
      )}
    </div>
  )
}
