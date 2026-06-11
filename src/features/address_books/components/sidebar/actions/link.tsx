'use client'

import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildAddressBookDavUrl } from '@/features/address_books/utils/address-book-url'
import { useCopyToClipboard } from '@/features/address_books/components/visualization/hooks/use-copy-to-clipboard'
import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo, useMemo } from 'react'

interface LinkActionProps {
  name: string
  id: string
}

function LinkAction({ id }: LinkActionProps) {
  const tCommons = useTranslations('COMMONS')
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { copyToClipboard } = useCopyToClipboard()

  const davUrl = useMemo(() => buildAddressBookDavUrl(id), [id])

  const handleCopy = () => {
    void copyToClipboard(davUrl, t('options.link.labels.name.string'))
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('options.link.title.string')}</DialogTitle>
      </DialogHeader>
      <DialogDescription asChild>
        <div className="space-y-2 py-2">
          <Label htmlFor="address-book-dav-url">
            {t('options.link.labels.name.string')}
          </Label>
          <div className="flex gap-2">
            <Input
              id="address-book-dav-url"
              type="text"
              readOnly
              value={davUrl}
              className="font-mono text-xs"
              data-testid="address-book-dav-url"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label={t('options.link.copy.string')}
              data-testid="copy-address-book-url"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
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

export default memo(LinkAction)
