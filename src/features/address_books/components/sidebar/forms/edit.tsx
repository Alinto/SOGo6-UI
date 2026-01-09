'use client'

import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputWithLabel } from '@/components/ui/input'
import { useUpdateAddressBookMutation } from '@/features/address_books/store/address-books-api'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

interface EditFormProps {
  name: string
  id: string
  onSuccess?: () => void
}

const EditForm: React.FC<EditFormProps> = ({ name, id, onSuccess }) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const [editedName, setEditedName] = useState(name)
  const [updateAddressBook, { isLoading }] = useUpdateAddressBookMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editedName.trim() || editedName.trim() === name) return

    try {
      await updateAddressBook({
        id,
        name: editedName.trim(),
      }).unwrap()
      onSuccess?.()
    } catch (error: unknown) {
      console.error('Failed to update address book:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>
          {t('options.edit.title.string', {
            name,
          })}
        </DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <div className="py-4">
          <InputWithLabel
            type="text"
            label={t('options.edit.labels.name.string')}
            className="w-full"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            required
          />
        </div>
      </DialogDescription>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            {formT('cancel.default.string')}
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={
            isLoading || !editedName.trim() || editedName.trim() === name
          }
        >
          {formT('save.default.string')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default EditForm
