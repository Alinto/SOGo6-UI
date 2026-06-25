'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import type { ContactKind } from '../../address-books-types'
import { useContactJobRunner } from '../../../hooks/use-contact-job-runner'
import {
  useExportContactDocumentMutation,
  useExportListDocumentMutation,
} from '../../../store/address-books-api'
import { getContactApiErrorMessageKey } from '../../../utils/map-contact-api-error'
import type { ContactTransferFormat } from '../../../utils/contact-transfer-formats'

const FORMATS: ContactTransferFormat[] = ['json', 'vcard3', 'vcard4', 'ldif']

type ExportEntryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bookId: string
  entryId: string
  entryLabel: string
  kind?: ContactKind
}

function ExportEntryDialog({
  open,
  onOpenChange,
  bookId,
  entryId,
  entryLabel,
  kind = 'individual',
}: ExportEntryDialogProps) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const [format, setFormat] = useState<ContactTransferFormat>('vcard3')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [exportContact, { isLoading: isExportingContact }] =
    useExportContactDocumentMutation()
  const [exportList, { isLoading: isExportingList }] =
    useExportListDocumentMutation()
  const { startJob, isPolling, isSuccess } = useContactJobRunner()

  const isSubmitting = isExportingContact || isExportingList || isPolling

  const handleSubmit = async () => {
    setSubmitError(null)
    try {
      const response =
        kind === 'group'
          ? await exportList({ bookId, listId: entryId, format }).unwrap()
          : await exportContact({
              bookId,
              contactId: entryId,
              format,
            }).unwrap()
      startJob(response, {
        operation: 'export',
        label: entryLabel,
        format,
      })
    } catch (error) {
      setSubmitError(tErrors(getContactApiErrorMessageKey(error, 'toast')))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('export.submit.string')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('export.description.string')}
            </p>
          </div>

          {submitError && <p className="text-destructive text-sm">{submitError}</p>}
          {isSuccess && (
            <p className="text-sm">{t('export.success.string')}</p>
          )}

          {!isSuccess && (
            <>
              <div className="space-y-2">
                <Label>{t('export.format.string')}</Label>
                <Select
                  value={format}
                  onValueChange={(value) =>
                    setFormat(value as ContactTransferFormat)
                  }
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

              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('export.submit.string')}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default memo(ExportEntryDialog)
