'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { VCard } from '@/features/address_books/address-books-types'
import {
  formDialogBodyClassName,
  formDialogContentClassName,
  formDialogFooterClassName,
  formDialogHeaderClassName,
  formDialogTitleClassName,
} from '@/lib/utils/form-dialog-layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'

const contactFormSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  organization: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  emails: z.array(z.object({ value: z.string().email().or(z.literal('')) })),
  phoneNumbers: z.array(z.object({ value: z.string().max(50) })),
  note: z.string().max(5000).optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

type ContactFormProps = {
  open: boolean
  isEditMode?: boolean
  isLoading?: boolean
  loadError?: boolean
  isSubmitting?: boolean
  contact?: VCard | null
  prefill?: Partial<VCard> | null
  onClose: () => void
  onSubmit: (values: ContactFormValues, contactId?: string) => Promise<void>
}

function toFieldArray(values?: string[]) {
  if (!values?.length) {
    return [{ value: '' }]
  }
  return values.map((value) => ({ value }))
}

function fromFieldArray(fields: { value: string }[]): string[] {
  return fields.map((field) => field.value.trim()).filter(Boolean)
}

function ContactForm({
  open,
  isEditMode = false,
  isLoading = false,
  loadError = false,
  isSubmitting = false,
  contact,
  prefill,
  onClose,
  onSubmit,
}: ContactFormProps) {
  const t = useTranslations('CONTACT_FORM')
  const isEdit = isEditMode || Boolean(contact?.id)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      organization: '',
      jobTitle: '',
      emails: [{ value: '' }],
      phoneNumbers: [{ value: '' }],
      note: '',
    },
  })

  const emailFields = useFieldArray({ control: form.control, name: 'emails' })
  const phoneFields = useFieldArray({
    control: form.control,
    name: 'phoneNumbers',
  })

  useEffect(() => {
    if (!open || isLoading || loadError) return

    if (contact) {
      form.reset({
        firstName: contact.firstName,
        lastName: contact.lastName,
        organization: contact.organization ?? '',
        jobTitle: contact.jobTitle ?? '',
        emails: toFieldArray(contact.emails),
        phoneNumbers: toFieldArray(contact.phoneNumbers),
        note: contact.note ?? '',
      })
      return
    }

    form.reset({
      firstName: prefill?.firstName ?? '',
      lastName: prefill?.lastName ?? '',
      organization: prefill?.organization ?? '',
      jobTitle: prefill?.jobTitle ?? '',
      emails: toFieldArray(prefill?.emails),
      phoneNumbers: toFieldArray(prefill?.phoneNumbers),
      note: prefill?.note ?? '',
    })
  }, [open, contact, prefill, form, isLoading, loadError])

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values, contact?.id)
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={formDialogContentClassName('lg')}>
        <DialogHeader className={formDialogHeaderClassName}>
          <DialogTitle className={formDialogTitleClassName}>
            {isEdit ? t('edit_contact.string') : t('new_contact.string')}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div
            className="flex flex-1 items-center justify-center py-12"
            data-testid="contact-form-loading"
          >
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        {loadError && !isLoading && (
          <>
            <div
              className="space-y-4 px-6 py-4"
              data-testid="contact-form-load-error"
            >
              <p className="text-destructive text-sm">{t('load_error.title.string')}</p>
              <p className="text-muted-foreground text-sm">
                {t('load_error.description.string')}
              </p>
            </div>
            <div className={formDialogFooterClassName}>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel.string')}
              </Button>
            </div>
          </>
        )}

        {!isLoading && !loadError && (
        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div className={formDialogBodyClassName}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.first_name.string')}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fields.last_name.string')}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="family-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.organization.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.job_title.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t('emails.string')}</FormLabel>
              {emailFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`emails.${index}.value`}
                    render={({ field: emailField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...emailField}
                            type="email"
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {emailFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => emailFields.remove(index)}
                      aria-label={t('remove_field.string')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => emailFields.append({ value: '' })}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('add_email.string')}
              </Button>
            </div>

            <div className="space-y-2">
              <FormLabel>{t('phone_numbers.string')}</FormLabel>
              {phoneFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`phoneNumbers.${index}.value`}
                    render={({ field: phoneField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...phoneField} type="tel" autoComplete="tel" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {phoneFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => phoneFields.remove(index)}
                      aria-label={t('remove_field.string')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => phoneFields.append({ value: '' })}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('add_phone.string')}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('notes.string')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            </div>

            <div className={formDialogFooterClassName}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('cancel.string')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? t('save.string') : t('create.string')}
              </Button>
            </div>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { fromFieldArray }
export default memo(ContactForm)
