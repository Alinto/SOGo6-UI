'use client'

import { useMailCategoryPicker } from '@/features/mails/hooks/use-mail-category-picker'
import { getMailLabelBulkStates } from '@/features/mails/utils/match-mail-labels'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MailLabelPickerDialogShell from './mail-label-picker-dialog-shell'

type MailBulkLabelPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Flags of every currently selected mail, used to pre-check/indeterminate labels. */
  selectedMailsFlags?: (string[] | undefined)[]
  onApplyLabels: (imapLabels: string[]) => Promise<void>
  onRemoveLabels?: (imapLabels: string[]) => Promise<void>
  isLoading?: boolean
}

export default function MailBulkLabelPickerDialog({
  open,
  onOpenChange,
  selectedMailsFlags = [],
  onApplyLabels,
  onRemoveLabels,
  isLoading = false,
}: MailBulkLabelPickerDialogProps) {
  // Explicit user choices only; anything absent falls back to the label's
  // initial (checked/indeterminate/unchecked) state across the selection.
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map())
  const [isApplying, setIsApplying] = useState(false)

  const {
    isFetching,
    allCategories,
    showNewTag,
    setShowNewTag,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    isDuplicateTagName,
    cancelNewTag,
    handleCreateTag,
    savePendingCategories,
  } = useMailCategoryPicker(open)

  const initialStates = useMemo(
    () => getMailLabelBulkStates(selectedMailsFlags, allCategories),
    [selectedMailsFlags, allCategories]
  )

  useEffect(() => {
    if (open) setOverrides(new Map())
  }, [open])

  const handleToggle = useCallback((imapLabel: string, checked: boolean) => {
    setOverrides((prev) => {
      const next = new Map(prev)
      next.set(imapLabel, checked)
      return next
    })
  }, [])

  const { selected, indeterminate } = useMemo(() => {
    const selectedNames = new Set<string>()
    const indeterminateNames = new Set<string>()
    for (const category of allCategories) {
      const override = overrides.get(category.name)
      if (override !== undefined) {
        if (override) selectedNames.add(category.name)
        continue
      }
      const initial = initialStates.get(category.name)
      if (initial === 'checked') selectedNames.add(category.name)
      else if (initial === 'indeterminate')
        indeterminateNames.add(category.name)
    }
    return { selected: selectedNames, indeterminate: indeterminateNames }
  }, [allCategories, overrides, initialStates])

  const { toApply, toRemove } = useMemo(() => {
    const apply: string[] = []
    const remove: string[] = []
    for (const [name, checked] of overrides) {
      const initial = initialStates.get(name)
      if (checked) {
        if (initial !== 'checked') apply.push(name)
      } else if (initial !== undefined) {
        remove.push(name)
      }
    }
    return { toApply: apply, toRemove: remove }
  }, [overrides, initialStates])

  const handleApply = useCallback(async () => {
    setIsApplying(true)
    try {
      const saved = await savePendingCategories()
      if (!saved) return
      await Promise.all([
        toApply.length > 0 ? onApplyLabels(toApply) : Promise.resolve(),
        toRemove.length > 0 && onRemoveLabels
          ? onRemoveLabels(toRemove)
          : Promise.resolve(),
      ])
      onOpenChange(false)
    } finally {
      setIsApplying(false)
    }
  }, [
    savePendingCategories,
    toApply,
    toRemove,
    onApplyLabels,
    onRemoveLabels,
    onOpenChange,
  ])

  const busy = isLoading || isFetching || isApplying

  return (
    <MailLabelPickerDialogShell
      open={open}
      onOpenChange={onOpenChange}
      allCategories={allCategories}
      selected={selected}
      indeterminate={indeterminate}
      onToggle={handleToggle}
      busy={busy}
      canApply={toApply.length > 0 || toRemove.length > 0}
      isApplying={isApplying}
      onApply={() => void handleApply()}
      showNewTag={showNewTag}
      onShowNewTag={() => setShowNewTag(true)}
      newTagName={newTagName}
      onNewTagNameChange={setNewTagName}
      newTagColor={newTagColor}
      onNewTagColorChange={setNewTagColor}
      isDuplicateTagName={isDuplicateTagName}
      onCancelNewTag={cancelNewTag}
      onCreateTag={() =>
        handleCreateTag((name) =>
          setOverrides((prev) => new Map(prev).set(name, true))
        )
      }
    />
  )
}
