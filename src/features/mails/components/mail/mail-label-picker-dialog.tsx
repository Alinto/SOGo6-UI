'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPicker, DEFAULT_COLORS } from '@/components/ui/color-picker'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMailCategoryMutation,
} from '@/features/user-settings/store/user-preferences-api'
import { Link } from '@/lib/i18n/navigation'
import { Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const tCategories = useTranslations('US_MAIL_CATEGORIES')
  const { data, isFetching } = useGetUserPreferencesQuery(undefined, {
    skip: !open,
  })
  const [updateCategories] = useUpdateUserPreferencesMailCategoryMutation()
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(appliedFlags)
  )
  const [pendingCategories, setPendingCategories] = useState<
    { name: string; color: string }[]
  >([])
  const [isApplying, setIsApplying] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0])

  useEffect(() => {
    if (open) {
      setSelected(new Set(appliedFlags))
      setPendingCategories([])
      setNewTagColor(DEFAULT_COLORS[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const categories = useMemo(
    () => data?.data.USER_MAIL_CATEGORY_SETTINGS?.SOGO_U_MAIL_CATEGORIES ?? [],
    [data]
  )

  const allCategories = useMemo(() => {
    const confirmedNames = new Set(
      categories.map((category) => category.name.toLowerCase())
    )
    const unconfirmedPending = pendingCategories.filter(
      (category) => !confirmedNames.has(category.name.toLowerCase())
    )
    return [
      ...categories,
      ...unconfirmedPending.map((category) => ({
        name: category.name,
        color: category.color,
        is_default: false,
      })),
    ].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    )
  }, [categories, pendingCategories])

  const trimmedNewTagName = newTagName.trim()

  const isDuplicateTagName = useMemo(() => {
    if (!trimmedNewTagName) return false
    return allCategories.some(
      (category) =>
        category.name.toLowerCase() === trimmedNewTagName.toLowerCase()
    )
  }, [trimmedNewTagName, allCategories])

  const hasChanges = useMemo(() => {
    if (pendingCategories.length > 0) return true
    if (selected.size !== appliedFlags.length) return true
    return appliedFlags.some((flag) => !selected.has(flag))
  }, [selected, appliedFlags, pendingCategories])

  const handleToggle = useCallback((imapLabel: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(imapLabel)
      else next.delete(imapLabel)
      return next
    })
  }, [])

  const handleCreateTag = useCallback(() => {
    const name = newTagName.trim()
    if (!name || isDuplicateTagName) return
    setPendingCategories((prev) => [...prev, { name, color: newTagColor }])
    setSelected((prev) => new Set(prev).add(name))
    setNewTagName('')
    setNewTagColor(DEFAULT_COLORS[0])
    setShowNewTag(false)
  }, [newTagName, newTagColor, isDuplicateTagName])

  const handleApply = useCallback(async () => {
    setIsApplying(true)
    try {
      if (pendingCategories.length > 0) {
        await updateCategories({
          SOGO_U_MAIL_CATEGORIES: allCategories,
        }).unwrap()
      }
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
    pendingCategories,
    allCategories,
    updateCategories,
    appliedFlags,
    selected,
    onApplyLabel,
    onRemoveLabel,
    onOpenChange,
  ])

  const busy = isLoading || isFetching || isApplying

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('label.string')}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto py-2">
          {busy && !allCategories.length ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
          {allCategories.map((category) => {
            const isSelected = selected.has(category.name)
            const displayName = category.is_default
              ? tCategories(`categories.${category.name}`)
              : category.name
            return (
              <label
                key={category.name}
                className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
              >
                <Checkbox
                  checked={isSelected}
                  disabled={busy}
                  onCheckedChange={(checked) => {
                    handleToggle(category.name, checked === true)
                  }}
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full border"
                  style={{ backgroundColor: category.color || 'transparent' }}
                />
                <span className="flex-1 text-sm">{displayName}</span>
              </label>
            )
          })}
          {!busy && allCategories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t('label_dialog.empty.string')}
            </p>
          ) : null}
        </div>

        {showNewTag ? (
          <div className="flex items-start gap-2">
            <ColorPicker
              value={newTagColor}
              onChange={setNewTagColor}
              disabled={busy}
            />
            <div className="flex flex-1 flex-col gap-1">
              <Input
                autoFocus
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder={t('label_dialog.new_tag_placeholder.string')}
                disabled={busy}
                aria-invalid={isDuplicateTagName}
              />
              {isDuplicateTagName ? (
                <p className="text-destructive text-xs">
                  {t('label_dialog.duplicate_name.string')}
                </p>
              ) : null}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                setShowNewTag(false)
                setNewTagName('')
                setNewTagColor(DEFAULT_COLORS[0])
              }}
            >
              {t('ham_confirm.cancel.string')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy || !newTagName.trim() || isDuplicateTagName}
              onClick={handleCreateTag}
            >
              {t('label_dialog.create.string')}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit gap-1"
            disabled={busy}
            onClick={() => setShowNewTag(true)}
          >
            <Plus className="h-4 w-4" />
            {t('label_dialog.new_tag.string')}
          </Button>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link href="/user_settings/mail/categories">
              {t('label_dialog.configure.string')}
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('ham_confirm.cancel.string')}
            </Button>
            <Button
              disabled={busy || !hasChanges}
              onClick={() => void handleApply()}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('label_dialog.apply.string')
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
