'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { MailCategoryOption } from '@/features/mails/hooks/use-mail-category-picker'
import { Link } from '@/lib/i18n/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  MailCategoryList,
  MailCategoryNewTagControl,
} from './mail-category-picker-fields'

type MailLabelPickerDialogShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  allCategories: MailCategoryOption[]
  selected: Set<string>
  indeterminate?: Set<string>
  onToggle: (name: string, checked: boolean) => void
  busy: boolean
  canApply: boolean
  isApplying: boolean
  onApply: () => void
  showNewTag: boolean
  onShowNewTag: () => void
  newTagName: string
  onNewTagNameChange: (name: string) => void
  newTagColor: string
  onNewTagColorChange: (color: string) => void
  isDuplicateTagName: boolean
  onCancelNewTag: () => void
  onCreateTag: () => void
}

/**
 * Shared Dialog/list/footer chrome for the single-mail and bulk label
 * picker dialogs. Callers own the selection state and apply logic; this
 * component only renders it.
 */
export default function MailLabelPickerDialogShell({
  open,
  onOpenChange,
  allCategories,
  selected,
  indeterminate,
  onToggle,
  busy,
  canApply,
  isApplying,
  onApply,
  showNewTag,
  onShowNewTag,
  newTagName,
  onNewTagNameChange,
  newTagColor,
  onNewTagColorChange,
  isDuplicateTagName,
  onCancelNewTag,
  onCreateTag,
}: MailLabelPickerDialogShellProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('label.string')}</DialogTitle>
        </DialogHeader>

        <MailCategoryList
          allCategories={allCategories}
          selected={selected}
          indeterminate={indeterminate}
          onToggle={onToggle}
          busy={busy}
        />

        <MailCategoryNewTagControl
          showNewTag={showNewTag}
          onShowNewTag={onShowNewTag}
          newTagName={newTagName}
          onNewTagNameChange={onNewTagNameChange}
          newTagColor={newTagColor}
          onNewTagColorChange={onNewTagColorChange}
          isDuplicateTagName={isDuplicateTagName}
          busy={busy}
          onCancel={onCancelNewTag}
          onCreate={onCreateTag}
        />

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
            <Button disabled={busy || !canApply} onClick={onApply}>
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
