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
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useGlobalAccessGrantMutations } from '../hooks/use-global-access-mutations'
import type { GlobalAccessUserEntry } from '../store/access-api'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface CopyAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: GlobalAccessUserEntry
}

const CopyAccessDialog: React.FC<CopyAccessDialogProps> = ({
  open,
  onOpenChange,
  entry,
}) => {
  const t = useTranslations('US_ACCESS')
  const { copyGrantToUser } = useGlobalAccessGrantMutations()

  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (!open) {
      setEmail('')
      setError(null)
      setIsSaving(false)
    }
  }, [open])

  const handleConfirm = async (): Promise<void> => {
    const trimmed = email.trim()
    const sourceEmail = (entry.c_email ?? entry.uid).toLowerCase()

    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t('user.copy.error.invalid.string'))
      return
    }
    if (trimmed.toLowerCase() === sourceEmail) {
      setError(t('user.copy.error.same.string'))
      return
    }

    setIsSaving(true)
    try {
      await Promise.all(
        entry.grants.map((grant) => copyGrantToUser(grant, trimmed))
      )
      onOpenChange(false)
    } catch {
      // Error surfaced by each mutation's own notification handler.
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('user.copy.title.string')}</DialogTitle>
          <DialogDescription>
            {t('user.copy.description.string', {
              user: entry.c_email ?? entry.uid,
              count: entry.grants.length,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('user.copy.placeholder.string')}
            className="h-9 text-sm"
            autoFocus
          />
          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('user.copy.cancel.string')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('user.copy.confirm.string')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CopyAccessDialog
