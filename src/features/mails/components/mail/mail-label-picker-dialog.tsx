'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useGetMailLabelsSettingsQuery } from '@/features/user-settings/mail/labels/store/mail-labels-settings-api'
import { Link } from '@/lib/i18n/navigation'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useMemo, useState } from 'react'

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
  const tLabels = useTranslations('US_MAIL_LABELS')
  const { data: labels, isFetching } = useGetMailLabelsSettingsQuery(undefined, {
    skip: !open,
  })
  const [pending, setPending] = useState<string | null>(null)

  const appliedSet = useMemo(() => new Set(appliedFlags), [appliedFlags])

  const handleToggle = useCallback(
    async (imapLabel: string, checked: boolean) => {
      setPending(imapLabel)
      try {
        if (checked) {
          await onApplyLabel(imapLabel)
        } else {
          await onRemoveLabel(imapLabel)
        }
      } finally {
        setPending(null)
      }
    },
    [onApplyLabel, onRemoveLabel]
  )

  const busy = isLoading || isFetching

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('label.string')}</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-64 flex-col gap-2 overflow-y-auto py-2">
          {busy && !labels?.length ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
          {(labels ?? []).map((label) => {
            const isApplied = appliedSet.has(label.IMAPLabel)
            const isItemPending = pending === label.IMAPLabel
            return (
              <label
                key={label.id}
                className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md px-2 py-2"
              >
                <Checkbox
                  checked={isApplied}
                  disabled={busy || isItemPending}
                  onCheckedChange={(checked) => {
                    void handleToggle(label.IMAPLabel, checked === true)
                  }}
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full border"
                  style={{ backgroundColor: label.color || 'transparent' }}
                />
                <span className="flex-1 text-sm">{label.label}</span>
                {isItemPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
              </label>
            )
          })}
          {!busy && (labels ?? []).length === 0 ? (
            <p className="text-muted-foreground text-sm">{tLabels('title.string')}</p>
          ) : null}
        </div>
        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button variant="link" className="h-auto p-0" asChild>
            <Link href="/user-settings/mail/labels">
              {tLabels('title.string')}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('ham_confirm.cancel.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
