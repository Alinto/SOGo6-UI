'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ArrowLeftRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type {
  FolderShareRights,
  SimplifiedPermissionKey,
} from '../../mails-types'
import {
  ADVANCED_PERMISSIONS,
  applyAdvancedToggle,
  applySimplifiedToggle,
  computeSimplifiedStates,
  getActiveAdvancedCodes,
  isReadForced,
  isSimplifiedChainForced,
  SIMPLIFIED_CHAIN,
  SIMPLIFIED_PERMISSIONS,
} from '../../utils/permission-mapping'

export interface UserPermissionsChange {
  rights: FolderShareRights
  permissions: string[]
}

interface UserPermissionsEditorProps {
  rights: FolderShareRights
  onChange: (next: UserPermissionsChange) => void
  applyToSubfolders: boolean
  onApplyToSubfoldersChange: (checked: boolean) => void
  disabled?: boolean
}

const CHAIN_DEFS = SIMPLIFIED_PERMISSIONS.filter((def) =>
  SIMPLIFIED_CHAIN.includes(def.key)
)
const STANDALONE_DEFS = SIMPLIFIED_PERMISSIONS.filter(
  (def) => !SIMPLIFIED_CHAIN.includes(def.key)
)

type PermissionsView = 'standard' | 'advanced'

export function UserPermissionsEditor({
  rights,
  onChange,
  applyToSubfolders,
  onApplyToSubfoldersChange,
  disabled,
}: UserPermissionsEditorProps) {
  const t = useTranslations('MAILS_COMMONS')
  const [view, setView] = React.useState<PermissionsView>('standard')
  const applyToSubfoldersId = React.useId()

  const simplifiedStates = computeSimplifiedStates(rights)
  const readForced = isReadForced(rights)

  const handleSimplifiedChange = (
    key: SimplifiedPermissionKey,
    checked: boolean
  ): void => {
    const nextRights = applySimplifiedToggle(rights, key, checked)
    onChange({
      rights: nextRights,
      permissions: getActiveAdvancedCodes(nextRights),
    })
  }

  const handleAdvancedChange = (
    field: keyof FolderShareRights,
    checked: boolean
  ): void => {
    const nextRights = applyAdvancedToggle(rights, field, checked)
    onChange({
      rights: nextRights,
      permissions: getActiveAdvancedCodes(nextRights),
    })
  }

  return (
    <div className="space-y-3 pt-1 pb-2 pl-1">
      <Button
        type="button"
        variant="link"
        size="sm"
        className="text-muted-foreground hover:text-foreground h-auto gap-1 p-0 text-xs font-medium"
        onClick={() => setView(view === 'standard' ? 'advanced' : 'standard')}
      >
        <ArrowLeftRight className="h-3.5 w-3.5" />
        {view === 'standard'
          ? t('folders.actions.sharing.viewToggle.toAdvanced.string')
          : t('folders.actions.sharing.viewToggle.toStandard.string')}
      </Button>

      {view === 'standard' ? (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {CHAIN_DEFS.map((def) => {
              const forced = isSimplifiedChainForced(rights, def.key)
              const checked = forced || simplifiedStates[def.key]

              return (
                <label
                  key={def.key}
                  className="flex items-start gap-2.5 text-sm leading-none"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    disabled={disabled || forced}
                    onCheckedChange={(c) =>
                      handleSimplifiedChange(def.key, c === true)
                    }
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{t(def.labelKey)}</span>
                    <span className="text-muted-foreground text-xs leading-snug">
                      {t(def.detailKey)}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>

          <Separator />

          <div className="space-y-2.5">
            {STANDALONE_DEFS.map((def) => {
              const checked = simplifiedStates[def.key]

              return (
                <label
                  key={def.key}
                  className="flex items-start gap-2.5 text-sm leading-none"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(c) =>
                      handleSimplifiedChange(def.key, c === true)
                    }
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{t(def.labelKey)}</span>
                    <span className="text-muted-foreground text-xs leading-snug">
                      {t(def.detailKey)}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {ADVANCED_PERMISSIONS.map((def) => {
            const isReadField =
              def.field === 'userCanViewFolder' ||
              def.field === 'userCanReadMails'
            const forced = isReadField && readForced
            const checked = forced || rights[def.field] === 1

            return (
              <label
                key={def.field}
                className="flex items-center gap-2.5 text-sm leading-none"
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled || forced}
                  onCheckedChange={(c) =>
                    handleAdvancedChange(def.field, c === true)
                  }
                />
                {/* eslint-disable-next-line react/jsx-no-literals */}
                <span>{`${def.imapCode} - ${t(def.labelKey)}`}</span>
              </label>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <Switch
            id={applyToSubfoldersId}
            checked={applyToSubfolders}
            disabled={disabled}
            onCheckedChange={onApplyToSubfoldersChange}
          />
          <Label htmlFor={applyToSubfoldersId} className="text-sm font-medium">
            {t('folders.actions.sharing.applyToSubfolders.string')}
          </Label>
        </div>
        <p className="text-muted-foreground text-xs leading-snug pt-1.5">
          {t('folders.actions.sharing.applyToSubfoldersHint.string')}
        </p>
      </div>
    </div>
  )
}
