'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import { useExportAddressBookDocumentMutation } from '../../../store/address-books-api'
import { useContactJobRunner } from '../../../hooks/use-contact-job-runner'
import { getContactApiErrorMessageKey } from '../../../utils/map-contact-api-error'
import type { ContactTransferFormat } from '../../../utils/contact-transfer-formats'

const FORMATS: ContactTransferFormat[] = ['json', 'vcard3', 'vcard4', 'ldif']

type ExportDialogProps = {
  bookId: string
  bookName: string
  onSuccess?: () => void
}

function ExportDialog({ bookId, bookName, onSuccess }: ExportDialogProps) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const [format, setFormat] = useState<ContactTransferFormat>('vcard3')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [exportAddressBook, { isLoading }] = useExportAddressBookDocumentMutation()
  const { startJob, isPolling, isSuccess } = useContactJobRunner()

  const isSubmitting = isLoading || isPolling

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      const response = await exportAddressBook({ bookId, format }).unwrap()
      startJob(response, {
        operation: 'export',
        label: bookName,
        format,
      })
    } catch (error) {
      setSubmitError(tErrors(getContactApiErrorMessageKey(error, 'toast')))
    }
  }

  if (isSuccess) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('options.export.string')}</DialogTitle>
          <DialogDescription>{t('export.success.string')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onSuccess}>
            {t('export.close.string')}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {t('export.title_book.string', { name: bookName })}
        </DialogTitle>
        <DialogDescription>{t('export.description.string')}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {submitError && <p className="text-destructive text-sm">{submitError}</p>}

        <div className="space-y-2">
          <Label>{t('export.format.string')}</Label>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as ContactTransferFormat)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATS.map((entry) => (
                <SelectItem key={entry} value={entry}>
                  {t(`import.format_${entry}.string`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isPolling && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('export.processing.string')}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('export.submit.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ExportDialog)
