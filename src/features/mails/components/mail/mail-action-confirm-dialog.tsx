'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type MailActionConfirmVariant = 'delete' | 'spam' | 'ham'

type MailActionConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant: MailActionConfirmVariant
  isLoading?: boolean
  onConfirm: () => void
}

const VARIANT_KEY: Record<
  MailActionConfirmVariant,
  'delete_confirm' | 'spam_confirm' | 'ham_confirm'
> = {
  delete: 'delete_confirm',
  spam: 'spam_confirm',
  ham: 'ham_confirm',
}

export function MailActionConfirmDialog({
  open,
  onOpenChange,
  variant,
  isLoading = false,
  onConfirm,
}: MailActionConfirmDialogProps) {
  const t = useTranslations('MAILS_COMMONS.mail_display.action-bar')
  const key = VARIANT_KEY[variant]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(`${key}.title.string`)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(`${key}.message.string`)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t(`${key}.cancel.string`)}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              variant === 'delete'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t(`${key}.confirm.string`)
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
