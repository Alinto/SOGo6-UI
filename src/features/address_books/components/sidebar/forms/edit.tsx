import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputWithLabel } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import React from 'react'

interface EditFormProps {
  name: string
  id: string
}

const EditForm: React.FC<EditFormProps> = ({ name }) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t('options.edit.title.string', {
            name,
          })}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <InputWithLabel
          type="text"
          label={t('options.edit.labels.name.string', {
            name,
          })}
          className="w-full"
        />
      </DialogDescription>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {formT('cancel.default.string')}
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default EditForm
