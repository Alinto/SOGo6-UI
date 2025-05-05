import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import React from 'react'

const DeleteAction: React.FC<{ name: string; id: string }> = ({ name }) => {
  const t = useTranslations('Address_Books')
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t('sidebar.options.delete.modal.title.string', { name })}
        </DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-space-between">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {t('sidebar.options.delete.modal.cancel.string')}
          </Button>
        </DialogClose>
        <Button type="button" variant="destructive">
          {t('sidebar.options.delete.default.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default DeleteAction
