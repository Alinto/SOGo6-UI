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

interface LinkActionProps {
  name: string
  id: string
}

const LinkAction: React.FC<LinkActionProps> = ({ name }) => {
  const tCommons = useTranslations('COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('options.link.title.string')}</DialogTitle>
      </DialogHeader>
      <DialogDescription>
        <InputWithLabel
          type="text"
          label={t('options.link.labels.name.string', {
            name,
          })}
          className="w-full"
        />
      </DialogDescription>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {tCommons('close.string')}
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default LinkAction
