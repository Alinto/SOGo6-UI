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
import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface AddAddressBookProps {
  type: 'personals' | 'subscriptions'
}

const AddAddressBook: React.FC<AddAddressBookProps> = ({ type }) => {
  const formT = useTranslations('FORM_COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const title =
    type === 'personals'
      ? t('add_personal.string')
      : t('add_subscriptions.string')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarGroupAction title={t('add_subscriptions.string')}>
          <Plus />
          <span className="sr-only">{t('add_subscriptions.string')}</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <InputWithLabel
          type="text"
          label={t('name.string')}
          className="w-full"
        />
        <DialogFooter className="sm:justify-space-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {formT('cancel.default.string')}
            </Button>
          </DialogClose>
          <Button type="button">{formT('save.default.string')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressBook
