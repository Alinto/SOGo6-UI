'use client'

import { useMailCategoryPicker } from '@/features/mails/hooks/use-mail-category-picker'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MailLabelPickerDialogShell from './mail-label-picker-dialog-shell'

type MailLabelPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  appliedFlags: string[]
  onApplyLabel: (imapLabel: string) => Promise<void>
  onRemoveLabel: (imapLabel: string) => Promise<void>
  isLoading?: boolean
}

export default function MailLabelPickerDialog({
  open,
  onOpenChange,
  appliedFlags,
  onApplyLabel,
  onRemoveLabel,
  isLoading = false,
}: MailLabelPickerDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(appliedFlags)
  )
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

  useEffect(() => {
    if (open) setSelected(new Set(appliedFlags))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const hasChanges = useMemo(() => {
    if (selected.size !== appliedFlags.length) return true
    return appliedFlags.some((flag) => !selected.has(flag))
  }, [selected, appliedFlags])

  const handleToggle = useCallback((imapLabel: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(imapLabel)
      else next.delete(imapLabel)
      return next
    })
  }, [])

  const handleApply = useCallback(async () => {
    setIsApplying(true)
    try {
      const saved = await savePendingCategories()
      if (!saved) return
      const initial = new Set(appliedFlags)
      const toApply = [...selected].filter((name) => !initial.has(name))
      const toRemove = [...initial].filter((name) => !selected.has(name))
      await Promise.all([
        ...toApply.map((name) => onApplyLabel(name)),
        ...toRemove.map((name) => onRemoveLabel(name)),
      ])
      onOpenChange(false)
    } finally {
      setIsApplying(false)
    }
  }, [
    savePendingCategories,
    appliedFlags,
    selected,
    onApplyLabel,
    onRemoveLabel,
    onOpenChange,
  ])

  const busy = isLoading || isFetching || isApplying

  return (
    <MailLabelPickerDialogShell
      open={open}
      onOpenChange={onOpenChange}
      allCategories={allCategories}
      selected={selected}
      onToggle={handleToggle}
      busy={busy}
      canApply={hasChanges}
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
          setSelected((prev) => new Set(prev).add(name))
        )
      }
    />
  )
}
