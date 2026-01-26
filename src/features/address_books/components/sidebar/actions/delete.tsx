'use client'

import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteAddressBookMutation } from '@/features/address_books/store/address-books-api'
import { useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import React from 'react'

const DeleteAction: React.FC<{ name: string; id: string }> = ({ name, id }) => {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const formT = useTranslations('FORM_COMMONS')
  const [deleteAddressBook, { isLoading }] = useDeleteAddressBookMutation()
  const { push } = useRouter()

  const handleDelete = async () => {
    try {
      await deleteAddressBook(id).unwrap()
      push('/address_books')
    } catch (error) {
      console.error('Failed to delete address book:', error)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t('options.delete.title.string', {
            name,
          })}
        </DialogTitle>
      </DialogHeader>
      <DialogFooter className="gap-2 sm:justify-space-between">
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            {formT('cancel.default.string')}
          </Button>
        </DialogClose>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {formT('delete.default.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default DeleteAction
