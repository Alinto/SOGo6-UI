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
import { useTranslations } from 'next-intl'
import React from 'react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface AddUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingKeys: Set<string>
  onAdd: (email: string) => void
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onOpenChange,
  existingKeys,
  onAdd,
}) => {
  const t = useTranslations('US_ACCESS')

  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setEmail('')
      setError(null)
    }
  }, [open])

  const handleConfirm = (): void => {
    const trimmed = email.trim()

    if (!EMAIL_REGEX.test(trimmed)) {
      setError(t('addUser.dialog.error.invalid.string'))
      return
    }
    if (existingKeys.has(trimmed.toLowerCase())) {
      setError(t('addUser.dialog.error.duplicate.string'))
      return
    }

    onAdd(trimmed)
    onOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addUser.dialog.title.string')}</DialogTitle>
          <DialogDescription>
            {t('addUser.dialog.description.string')}
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
            placeholder={t('addUser.dialog.placeholder.string')}
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
          >
            {t('addUser.dialog.cancel.string')}
          </Button>
          <Button type="button" onClick={handleConfirm}>
            {t('addUser.dialog.confirm.string')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddUserDialog
