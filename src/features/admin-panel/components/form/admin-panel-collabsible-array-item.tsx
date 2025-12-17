'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import type { ConfigOption } from '../../types/admin-config'
import FieldRenderer from './admin-panel-field-renderer'

const CollapsibleArrayItem: React.FC<{
  index: number
  configOptions: ConfigOption[]
  sectionKey: string
  form: UseFormReturn<any>
  isSectionDuplicable?: boolean
}> = ({ index, configOptions, sectionKey, form, isSectionDuplicable }) => {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // If there is a field US_TYPE or similar, use it as header
  const watchedType = form.watch(`${sectionKey}.${index}.US_TYPE`)
  const headerLabel =
    (typeof watchedType === 'string' && watchedType) ||
    (typeof (form.getValues() as any)[sectionKey]?.[index]?.US_TYPE ===
      'string' &&
      (form.getValues() as any)[sectionKey][index].US_TYPE) ||
    `#${index + 1}`

  // compute current items and how many existing (non-null) entries there are
  const items = ((form.getValues() as any)[sectionKey] ?? []) as any[]
  const existingNonNullCount = Array.isArray(items)
    ? items.filter((x) => x !== null && x !== undefined).length
    : 0

  // enforce minimum-one rule only for USER_SOURCE (per your request)
  const enforceMinOne = sectionKey === 'USER_SOURCE'
  const isDeleteDisabled = enforceMinOne && existingNonNullCount <= 1

  function performDelete() {
    // If we must keep at least one and this is the last one, refuse
    if (isDeleteDisabled) {
      //toast?
      return
    }

    // Instead of removing the array element (which would shift indices and break
    // original_keys alignment), replace the slot with null. buildSettingsPayload
    // will later map the original key (from original_keys) to this null value.
    const itemsLocal = ((form.getValues() as any)[sectionKey] ?? []) as any[]
    const newArr = Array.isArray(itemsLocal) ? [...itemsLocal] : []
    // ensure index exists in array
    while (newArr.length <= index) {
      newArr.push(undefined)
    }
    newArr[index] = null
    // Mark form dirty so submit button is enabled
    form.setValue(sectionKey, newArr, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    })

    // close the item panel if open
    setOpen(false)
  }

  function handleDeleteClick(e: React.MouseEvent<HTMLButtonElement>) {
    // Prevent the header toggle and open the confirmation dialog
    e.stopPropagation()
    e.preventDefault()

    // If deletion not allowed, show immediate feedback and do not open confirm
    if (isDeleteDisabled) {
      //toast?
      return
    }

    setConfirmOpen(true)
  }

  function confirmAndDelete() {
    performDelete()
    setConfirmOpen(false)
  }

  function toggleOpen() {
    setOpen((v) => !v)
  }
  const t = useTranslations('ADMIN_PANEL.FORM')
  return (
    // group to show delete button on hover; relative for absolute positioning
    <div className="group relative mb-3">
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls={`${sectionKey}-${index}-panel`}
        className="hover:bg-secondary w-full cursor-pointer rounded border px-4 py-3 text-left shadow-sm hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded px-2 py-0.5 text-sm font-medium">
              {headerLabel}
            </div>
            <div className="text-muted-foreground text-sm">({sectionKey})</div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              aria-label={`Delete ${sectionKey} item ${index + 1}`}
              className="absolute right-12 z-10 opacity-0 group-hover:opacity-100"
              disabled={isDeleteDisabled}
              title={
                isDeleteDisabled
                  ? t('impossible-to-delete-at-least-one-instance-required') //TODO: trad
                  : undefined
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="text-xl select-none">{open ? '−' : '+'}</div>
          </div>
        </div>
      </div>

      {open && (
        <div
          id={`${sectionKey}-${index}-panel`}
          className="mt-2 rounded border p-4 shadow-sm"
        >
          {/* Render only root fields (no depends) here.
              Dependent fields will be rendered nested by FieldRenderer. */}
          {configOptions
            .filter((opt) => !opt.depends)
            .map((opt) => (
              <FieldRenderer
                key={opt.name}
                fieldOption={opt}
                fullFieldName={`${sectionKey}.${index}.${opt.name}`}
                form={form}
                sectionKey={sectionKey}
                sectionOptions={configOptions}
                isSectionDuplicable={isSectionDuplicable}
              />
            ))}
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {sectionKey} item? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmAndDelete}
              disabled={isDeleteDisabled}
              title={
                isDeleteDisabled
                  ? 'Impossible de supprimer: au moins une instance requise'
                  : undefined
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CollapsibleArrayItem
