'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { CONTACT_PHOTO_MAX_BYTES } from '@/features/address_books/utils/serialize-contact'
import { mapApiToContactGeneralSettings } from '@/features/user-settings/address-books/store/address-books-utils'
import { useGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
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
import { memo, useEffect, useMemo, type ChangeEvent } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

const addressRowSchema = z.object({
  street: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  postalCode: z.string().max(50).optional(),
  country: z.string().max(100).optional(),
})

const contactFormSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  organization: z.string().max(200).optional(),
  jobTitle: z.string().max(200).optional(),
  emails: z.array(z.object({ value: z.string().email().or(z.literal('')) })),
  phoneNumbers: z.array(z.object({ value: z.string().max(50) })),
  addresses: z.array(addressRowSchema),
  urls: z.array(z.object({ value: z.string().url().or(z.literal('')) })),
  birthday: z.string().max(20).optional(),
  categories: z.array(z.string()),
  photoDataUri: z.string().optional(),
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
  submitError?: string | null
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

function toAddressFieldArray(addresses?: string[]) {
  if (!addresses?.length) {
    return [{ street: '', city: '', postalCode: '', country: '' }]
  }
  return addresses.map((line) => ({
    street: line,
    city: '',
    postalCode: '',
    country: '',
  }))
}

function ContactForm({
  open,
  isEditMode = false,
  isLoading = false,
  loadError = false,
  isSubmitting = false,
  contact,
  prefill,
  submitError,
  onClose,
  onSubmit,
}: ContactFormProps) {
  const t = useTranslations('CONTACT_FORM')
  const tErrors = useTranslations('ADDRESS_BOOKS_ERRORS')
  const isEdit = isEditMode || Boolean(contact?.id)
  const { data: preferences } = useGetUserPreferencesQuery()

  const categoryOptions = useMemo(() => {
    if (!preferences) return []
    return mapApiToContactGeneralSettings(preferences).categories
  }, [preferences])

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      organization: '',
      jobTitle: '',
      emails: [{ value: '' }],
      phoneNumbers: [{ value: '' }],
      addresses: [{ street: '', city: '', postalCode: '', country: '' }],
      urls: [{ value: '' }],
      birthday: '',
      categories: [],
      photoDataUri: undefined,
      note: '',
    },
  })

  const emailFields = useFieldArray({ control: form.control, name: 'emails' })
  const phoneFields = useFieldArray({
    control: form.control,
    name: 'phoneNumbers',
  })
  const addressFields = useFieldArray({
    control: form.control,
    name: 'addresses',
  })
  const urlFields = useFieldArray({ control: form.control, name: 'urls' })
  const selectedCategories =
    useWatch({ control: form.control, name: 'categories' }) ?? []
  const photoPreview = useWatch({ control: form.control, name: 'photoDataUri' })

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
        addresses: toAddressFieldArray(contact.addresses),
        urls: toFieldArray(contact.urls),
        birthday: contact.birthday ?? '',
        categories: contact.categories ?? [],
        photoDataUri: contact.photos?.[0] ?? contact.photo,
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
      addresses: toAddressFieldArray(prefill?.addresses),
      urls: toFieldArray(prefill?.urls),
      birthday: prefill?.birthday ?? '',
      categories: prefill?.categories ?? [],
      photoDataUri: prefill?.photo,
      note: prefill?.note ?? '',
    })
  }, [open, contact, prefill, form, isLoading, loadError])

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > CONTACT_PHOTO_MAX_BYTES) {
      form.setError('photoDataUri', {
        message: tErrors('file_too_large.string'),
      })
      return
    }

    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    form.clearErrors('photoDataUri')
    form.setValue('photoDataUri', dataUri)
  }

  const handleRemovePhoto = () => {
    form.setValue('photoDataUri', undefined)
  }

  const handleCategoryToggle = (name: string, checked: boolean) => {
    const current = form.getValues('categories')
    form.setValue(
      'categories',
      checked ? [...current, name] : current.filter((item) => item !== name)
    )
  }

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
            {submitError && (
              <p className="text-destructive text-sm" data-testid="contact-form-submit-error">
                {submitError}
              </p>
            )}
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

            <div className="space-y-2">
              <FormLabel>{t('addresses.string')}</FormLabel>
              {addressFields.fields.map((field, index) => (
                <div key={field.id} className="space-y-2 rounded-md border p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.street`}
                      render={({ field: streetField }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t('fields.street.string')}</FormLabel>
                          <FormControl>
                            <Input {...streetField} autoComplete="street-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.city`}
                      render={({ field: cityField }) => (
                        <FormItem>
                          <FormLabel>{t('fields.city.string')}</FormLabel>
                          <FormControl>
                            <Input {...cityField} autoComplete="address-level2" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.postalCode`}
                      render={({ field: postalField }) => (
                        <FormItem>
                          <FormLabel>{t('fields.postal_code.string')}</FormLabel>
                          <FormControl>
                            <Input {...postalField} autoComplete="postal-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.country`}
                      render={({ field: countryField }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>{t('fields.country.string')}</FormLabel>
                          <FormControl>
                            <Input {...countryField} autoComplete="country-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {addressFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addressFields.remove(index)}
                      aria-label={t('remove_field.string')}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      {t('remove_field.string')}
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  addressFields.append({
                    street: '',
                    city: '',
                    postalCode: '',
                    country: '',
                  })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('add_address.string')}
              </Button>
            </div>

            <div className="space-y-2">
              <FormLabel>{t('urls.string')}</FormLabel>
              {urlFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`urls.${index}.value`}
                    render={({ field: urlField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...urlField} type="url" placeholder="https://" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {urlFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => urlFields.remove(index)}
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
                onClick={() => urlFields.append({ value: '' })}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('add_url.string')}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('birthday.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {categoryOptions.length > 0 && (
              <div className="space-y-2">
                <FormLabel>{t('categories.string')}</FormLabel>
                <div className="flex flex-wrap gap-3">
                  {categoryOptions.map((category) => (
                    <label
                      key={category.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(category.name, checked === true)
                        }
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <FormLabel>{t('photo.string')}</FormLabel>
              {photoPreview && (
                <div
                  role="img"
                  aria-label={t('photo.string')}
                  className="h-20 w-20 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${photoPreview})` }}
                />
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <label>
                    {photoPreview ? t('photo_change.string') : t('photo.string')}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                  >
                    {t('photo_remove.string')}
                  </Button>
                )}
              </div>
              <FormField
                control={form.control}
                name="photoDataUri"
                render={() => <FormMessage />}
              />
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
