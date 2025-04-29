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
  const t = useTranslations('Address_Books')
  const title =
    type === 'personals'
      ? t('sidebar.add_personal.string')
      : t('sidebar.add_subscriptions.string')

  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarGroupAction title={t('sidebar.add_subscriptions.string')}>
          <Plus />
          <span className="sr-only">
            {t('sidebar.add_subscriptions.string')}
          </span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription />
        <InputWithLabel
          type="text"
          label={t('sidebar.label_name.string')}
          className="w-full"
        />
        <DialogFooter className="sm:justify-space-between">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button type="button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressBook
