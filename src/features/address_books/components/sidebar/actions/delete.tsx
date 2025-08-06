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
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const formT = useTranslations('FORM_COMMONS')
  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t('options.delete.title.string', {
            name,
          })}
        </DialogTitle>
      </DialogHeader>
      <DialogFooter className="sm:justify-space-between">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {formT('cancel.default.string')}
          </Button>
        </DialogClose>
        <Button type="button" variant="destructive">
          {formT('delete.default.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default DeleteAction
