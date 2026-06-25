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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useState } from 'react'
import {
  useImportAddressBookDocumentMutation,
  useImportContactsDocumentMutation,
  useImportListsDocumentMutation,
} from '../../../store/address-books-api'
import { useContactJobRunner } from '../../../hooks/use-contact-job-runner'
import { getContactApiErrorMessageKey } from '../../../utils/map-contact-api-error'
import type {
  ContactImportScope,
  ContactTransferFormat,
} from '../../../utils/contact-transfer-formats'

const FORMATS: ContactTransferFormat[] = ['json', 'vcard3', 'vcard4', 'ldif']

type ImportDialogProps = {
  bookId?: string
  bookName?: string
  onSuccess?: () => void
}

function ImportDialog({ bookId, bookName, onSuccess }: ImportDialogProps) {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const [scope, setScope] = useState<ContactImportScope>(
    bookId ? 'contacts' : 'new_book'
  )
  const [format, setFormat] = useState<ContactTransferFormat>('json')
  const [file, setFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [importAddressBook, { isLoading: isImportingBook }] =
    useImportAddressBookDocumentMutation()
  const [importContacts, { isLoading: isImportingContacts }] =
    useImportContactsDocumentMutation()
  const [importLists, { isLoading: isImportingLists }] =
    useImportListsDocumentMutation()
  const { startJob, isPolling, isSuccess, statusMessage, cancelJob, isCancelling } =
    useContactJobRunner()

  const isSubmitting =
    isImportingBook || isImportingContacts || isImportingLists || isPolling

  const handleSubmit = async () => {
    if (!file) {
      setSubmitError(tErrors('import_no_file.string'))
      return
    }

    setSubmitError(null)

    try {
      if (scope === 'new_book') {
        const response = await importAddressBook({ file, format }).unwrap()
        startJob(response, { operation: 'import' })
        return
      }

      if (!bookId) return

      const response =
        scope === 'lists'
          ? await importLists({ bookId, file, format }).unwrap()
          : await importContacts({ bookId, file, format }).unwrap()
      startJob(response, { operation: 'import' })
    } catch (error) {
      setSubmitError(tErrors(getContactApiErrorMessageKey(error, 'toast')))
    }
  }

  if (isSuccess) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{t('options.import.string')}</DialogTitle>
          <DialogDescription>
            {statusMessage
              ? t('import.success_with_counts.string', {
                  counts: statusMessage,
                })
              : t('import.success.string')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onSuccess}>
            {t('import.close.string')}
          </Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {bookName
            ? t('import.title_book.string', { name: bookName })
            : t('options.import.string')}
        </DialogTitle>
        <DialogDescription>{t('import.description.string')}</DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {submitError && <p className="text-destructive text-sm">{submitError}</p>}

        {!bookId ? (
          <input type="hidden" value="new_book" readOnly />
        ) : (
          <div className="space-y-2">
            <Label>{t('import.scope.string')}</Label>
            <Select
              value={scope}
              onValueChange={(value) => setScope(value as ContactImportScope)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacts">
                  {t('import.scope_contacts.string')}
                </SelectItem>
                <SelectItem value="lists">
                  {t('import.scope_lists.string')}
                </SelectItem>
                <SelectItem value="new_book">
                  {t('import.scope_new_book.string')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>{t('import.format.string')}</Label>
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

        <div className="space-y-2">
          <Label htmlFor="contact-import-file">{t('import.file.string')}</Label>
          <Input
            id="contact-import-file"
            type="file"
            accept=".json,.vcf,.ldif,application/json,text/vcard,text/ldif"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        {isPolling && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('import.processing.string')}
          </div>
        )}
      </div>

      <DialogFooter>
        {isPolling && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void cancelJob()}
            disabled={isCancelling}
            data-testid="import-cancel-button"
          >
            {t('import.cancel.string')}
          </Button>
        )}
        <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('import.submit.string')}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ImportDialog)
