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
import { Input } from '@/components/ui/input'
import {
  useAddMailboxDelegateMutation,
  useGetMailboxDelegatesQuery,
} from '@/features/user-settings/mail/external-accounts/store/mailboxes-api'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface DelegateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DelegateDialog({ open, onOpenChange }: DelegateDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { data: delegates = [], isLoading } = useGetMailboxDelegatesQuery(
    undefined,
    { skip: !open }
  )
  const [addDelegate, { isLoading: isAdding }] = useAddMailboxDelegateMutation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)

  const handleAdd = async () => {
    const trimmed = email.trim()
    if (!trimmed) return
    setError(false)
    try {
      await addDelegate({ email: trimmed }).unwrap()
      setEmail('')
    } catch {
      setError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('account_switcher.delegate.title.string')}
          </DialogTitle>
          <DialogDescription>
            {t('account_switcher.delegate.dialog_description.string')}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? null : delegates.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('account_switcher.delegate.empty.string')}
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {delegates.map((delegate) => (
              <li key={delegate}>{delegate}</li>
            ))}
          </ul>
        )}
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            void handleAdd()
          }}
        >
          <Input
            type="email"
            value={email}
            aria-label={t('account_switcher.delegate.email.string')}
            placeholder={t('account_switcher.delegate.email.string')}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" disabled={isAdding || !email.trim()}>
            {t('account_switcher.delegate.add.string')}
          </Button>
        </form>
        {error && (
          <p className="text-destructive text-sm">
            {t('account_switcher.delegate.error.string')}
          </p>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('account_switcher.delegate.close.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
