'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InputWithLabel } from '@/components/ui/input'
import { SidebarGroupAction } from '@/components/ui/sidebar'
import { useAddAddressBookMutation } from '@/features/address_books/store/address-books-api'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

interface AddAddressBookProps {
  type: 'personals' | 'subscriptions'
}

const AddAddressBook: React.FC<AddAddressBookProps> = ({ type }) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [addAddressBook, { isLoading }] = useAddAddressBookMutation()

  const title =
    type === 'personals'
      ? t('add_personal.string')
      : t('add_subscriptions.string')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await addAddressBook({
        name: name.trim(),
        description: '',
        type: type === 'personals' ? 'personal' : 'shared',
      }).unwrap()
      setName('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create address book:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction
          title={title}
          className={cn(
            'cursor-pointer',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            'aspect-square h-5 w-5'
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">{title}</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogDescription />
          <div className="py-4">
            <InputWithLabel
              type="text"
              label={t('name.string')}
              className="w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="sm:justify-space-between">
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={isLoading}>
                {formT('cancel.default.string')}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {formT('save.default.string')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressBook
