'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ColorPicker } from '@/components/ui/color-picker'
import { Input } from '@/components/ui/input'
import type { MailCategoryOption } from '@/features/mails/hooks/use-mail-category-picker'
import { Loader2, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

type MailCategoryListProps = {
  allCategories: MailCategoryOption[]
  selected: Set<string>
  indeterminate?: Set<string>
  onToggle: (name: string, checked: boolean) => void
  busy: boolean
}

export function MailCategoryList({
  allCategories,
  selected,
  indeterminate,
  onToggle,
  busy,
}: MailCategoryListProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const tCategories = useTranslations('US_MAIL_CATEGORIES')

  return (
    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto py-2">
      {busy && !allCategories.length ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : null}
      {allCategories.map((category) => {
        const isIndeterminate = indeterminate?.has(category.name) ?? false
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
              checked={isIndeterminate ? 'indeterminate' : isSelected}
              disabled={busy}
              onCheckedChange={(checked) => {
                onToggle(category.name, checked === true)
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
  )
}

type MailCategoryNewTagControlProps = {
  showNewTag: boolean
  onShowNewTag: () => void
  newTagName: string
  onNewTagNameChange: (name: string) => void
  newTagColor: string
  onNewTagColorChange: (color: string) => void
  isDuplicateTagName: boolean
  busy: boolean
  onCancel: () => void
  onCreate: () => void
}

export function MailCategoryNewTagControl({
  showNewTag,
  onShowNewTag,
  newTagName,
  onNewTagNameChange,
  newTagColor,
  onNewTagColorChange,
  isDuplicateTagName,
  busy,
  onCancel,
  onCreate,
}: MailCategoryNewTagControlProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  if (!showNewTag) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit gap-1"
        disabled={busy}
        onClick={onShowNewTag}
      >
        <Plus className="h-4 w-4" />
        {t('label_dialog.new_tag.string')}
      </Button>
    )
  }

  return (
    <div className="flex items-start gap-2">
      <ColorPicker
        value={newTagColor}
        onChange={onNewTagColorChange}
        disabled={busy}
      />
      <div className="flex flex-1 flex-col gap-1">
        <Input
          autoFocus
          value={newTagName}
          onChange={(e) => onNewTagNameChange(e.target.value)}
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
        onClick={onCancel}
      >
        {t('ham_confirm.cancel.string')}
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={busy || !newTagName.trim() || isDuplicateTagName}
        onClick={onCreate}
      >
        {t('label_dialog.create.string')}
      </Button>
    </div>
  )
}
