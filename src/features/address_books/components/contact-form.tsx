'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  AddressBook,
  VCard,
} from '@/features/address_books/address-books-types'
import { parseContactName } from '@/features/address_books/utils/contact-list'
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
import { ChevronDown, Loader2, Plus, Trash2, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

/** undefined = unchanged, null = removed, string = new or replaced inline photo */
type PhotoPayload = string | null | undefined

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Invalid read result'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'))
    reader.readAsDataURL(file)
  })
}

const addressRowSchema = z.object({
  street: z.string().max(500).optional(),
  city: z.string().max(200).optional(),
  postalCode: z.string().max(50).optional(),
  region: z.string().max(200).optional(),
  poBox: z.string().max(200).optional(),
  extended: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
})

const contactFieldTypeSchema = z.enum(['_none', 'work', 'home', 'other'])
const phoneFieldTypeSchema = z.enum([
  '_none',
  'work',
  'home',
  'mobile',
  'other',
])

const contactFormSchema = z
  .object({
    bookId: z.string().optional(),
    contactKind: z.enum(['individual', 'org']),
    name: z.string().max(201),
    firstName: z.string().max(100),
    lastName: z.string().max(100),
    middleName: z.string().max(100).optional(),
    prefix: z.string().max(50).optional(),
    suffix: z.string().max(50).optional(),
    nickname: z.string().max(100).optional(),
    organization: z.string().max(200).optional(),
    department: z.string().max(200).optional(),
    jobTitle: z.string().max(200).optional(),
    title: z.string().max(200).optional(),
    emails: z.array(
      z.object({
        value: z.string().email().or(z.literal('')),
        type: contactFieldTypeSchema.optional(),
        pref: z.boolean().optional(),
      })
    ),
    phoneNumbers: z.array(
      z.object({
        value: z.string().max(50),
        type: phoneFieldTypeSchema.optional(),
        pref: z.boolean().optional(),
      })
    ),
    addresses: z.array(addressRowSchema),
    urls: z.array(z.object({ value: z.string().url().or(z.literal('')) })),
    impp: z.array(z.object({ value: z.string().max(500) })),
    birthday: z.string().max(20).optional(),
    birthdayUnknownYear: z.boolean().optional(),
    anniversary: z.string().max(20).optional(),
    categories: z.array(z.string()),
    photoDataUri: z.string().optional(),
    clearPhoto: z.boolean().optional(),
    note: z.string().max(5000).optional(),
  })
  .superRefine((data, ctx) => {
    const hasName = data.name.trim().length > 0
    const hasEmail = data.emails.some((entry) => entry.value.trim())
    const hasPhone = data.phoneNumbers.some((entry) => entry.value.trim())
    const hasOrganization = Boolean(data.organization?.trim())
    if (!hasName && !hasEmail && !hasPhone && !hasOrganization) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'required',
      })
    }
  })

export type ContactFormValues = z.infer<typeof contactFormSchema>

const EMPTY_ADDRESS_BOOKS: Pick<AddressBook, 'id' | 'name'>[] = []

type ContactFormProps = {
  open: boolean
  isEditMode?: boolean
  isLoading?: boolean
  loadError?: boolean
  isSubmitting?: boolean
  contact?: VCard | null
  prefill?: Partial<VCard> | null
  addressBooks?: Pick<AddressBook, 'id' | 'name'>[]
  defaultBookId?: string | null
  submitError?: string | null
  onClose: () => void
  onSubmit: (values: ContactFormValues, contactId?: string) => Promise<void>
}

function toFieldArray(values?: string[]) {
  if (!values?.length) return []
  return values.map((value) => ({ value }))
}

function contactNameValue(contact?: Partial<VCard> | null) {
  const person = `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`.trim()
  if (person) return person
  if (contact?.kind === 'org') return contact.organization?.trim() ?? ''
  return ''
}

function contactHasExtraDetails(contact?: Partial<VCard> | null) {
  if (!contact) return false
  return Boolean(
    contact.middleName?.trim() ||
    contact.prefix?.trim() ||
    contact.suffix?.trim() ||
    contact.nickname?.trim() ||
    contact.department?.trim() ||
    contact.jobTitle?.trim() ||
    contact.title?.trim() ||
    contact.addresses?.length ||
    contact.structuredAddresses?.length ||
    contact.urls?.length ||
    contact.impp?.length ||
    contact.birthday?.trim() ||
    contact.anniversary?.trim() ||
    contact.note?.trim() ||
    contact.categories?.length
  )
}

const EMPTY_ADDRESS = {
  street: '',
  city: '',
  postalCode: '',
  region: '',
  poBox: '',
  extended: '',
  country: '',
}

function toEmailFieldArray(contact?: VCard | null) {
  if (contact?.structuredEmails?.length) {
    return contact.structuredEmails.map((entry) => ({
      value: entry.value,
      type: (entry.types?.[0] ?? '_none') as z.infer<
        typeof contactFieldTypeSchema
      >,
      pref: entry.pref === 1,
    }))
  }
  if (!contact?.emails?.length) {
    return [{ value: '', type: '_none' as const, pref: false }]
  }
  return contact.emails.map((value) => ({
    value,
    type: '_none' as const,
    pref: false,
  }))
}

function toPhoneFieldArray(contact?: VCard | null) {
  if (contact?.structuredPhones?.length) {
    return contact.structuredPhones.map((entry) => ({
      value: entry.number,
      type: (entry.types?.[0] ?? '_none') as z.infer<
        typeof phoneFieldTypeSchema
      >,
      pref: entry.pref === 1,
    }))
  }
  if (!contact?.phoneNumbers?.length) {
    return [{ value: '', type: '_none' as const, pref: false }]
  }
  return contact.phoneNumbers.map((value) => ({
    value,
    type: '_none' as const,
    pref: false,
  }))
}

function fromFieldArray(fields: { value: string }[]): string[] {
  return fields.map((field) => field.value.trim()).filter(Boolean)
}

function toAddressFieldArray(contact?: VCard | null) {
  const structured = contact?.structuredAddresses
  if (structured?.length) {
    return structured.map((address) => ({
      street: address.street ?? '',
      city: address.locality ?? '',
      postalCode: address.postal_code ?? '',
      region: address.region ?? '',
      poBox: address.po_box ?? '',
      extended: address.extended ?? '',
      country: address.country ?? '',
    }))
  }

  if (!contact?.addresses?.length) return []

  return contact.addresses.map((line) => ({
    street: line,
    city: '',
    postalCode: '',
    region: '',
    poBox: '',
    extended: '',
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
  addressBooks = EMPTY_ADDRESS_BOOKS,
  defaultBookId,
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
      bookId: defaultBookId ?? '',
      contactKind: 'individual',
      name: '',
      firstName: '',
      lastName: '',
      middleName: '',
      prefix: '',
      suffix: '',
      nickname: '',
      organization: '',
      department: '',
      jobTitle: '',
      title: '',
      emails: [{ value: '', type: '_none', pref: false }],
      phoneNumbers: [{ value: '', type: '_none', pref: false }],
      addresses: [],
      urls: [],
      impp: [],
      birthday: '',
      birthdayUnknownYear: false,
      anniversary: '',
      categories: [],
      photoDataUri: undefined,
      clearPhoto: false,
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
  const imppFields = useFieldArray({ control: form.control, name: 'impp' })
  const selectedCategories =
    useWatch({ control: form.control, name: 'categories' }) ?? []

  const [photoPreviewSrc, setPhotoPreviewSrc] = useState<string | undefined>()
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const photoPayloadRef = useRef<PhotoPayload>(undefined)
  const photoObjectUrlRef = useRef<string | null>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const revokePhotoObjectUrl = useCallback(() => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current)
      photoObjectUrlRef.current = null
    }
  }, [])

  const emailTypeOptions = ['_none', 'work', 'home', 'other'] as const
  const phoneTypeOptions = ['_none', 'work', 'home', 'mobile', 'other'] as const

  const formResetKey = useMemo(() => {
    if (!open) return null
    if (contact) return `edit:${contact.id}:${contact.updated_at ?? ''}`
    return `create:${defaultBookId ?? ''}:${prefill?.firstName ?? ''}:${prefill?.lastName ?? ''}`
  }, [open, contact, prefill, defaultBookId])

  useEffect(() => {
    return () => {
      revokePhotoObjectUrl()
    }
  }, [revokePhotoObjectUrl])

  useEffect(() => {
    if (!formResetKey || isLoading || loadError) return

    revokePhotoObjectUrl()
    photoPayloadRef.current = undefined
    setPhotoError(null)

    if (contact) {
      form.reset({
        bookId: defaultBookId ?? '',
        contactKind: contact.kind === 'org' ? 'org' : 'individual',
        name: contactNameValue(contact),
        firstName: contact.firstName,
        lastName: contact.lastName,
        middleName: contact.middleName ?? '',
        prefix: contact.prefix ?? '',
        suffix: contact.suffix ?? '',
        nickname: contact.nickname ?? '',
        organization: contact.organization ?? '',
        department: contact.department ?? '',
        jobTitle: contact.jobTitle ?? '',
        title: contact.title ?? '',
        emails: toEmailFieldArray(contact),
        phoneNumbers: toPhoneFieldArray(contact),
        addresses: toAddressFieldArray(contact),
        urls: toFieldArray(contact.urls),
        impp: toFieldArray(contact.impp),
        birthday: contact.birthday?.startsWith('--')
          ? contact.birthday.slice(2)
          : (contact.birthday ?? ''),
        birthdayUnknownYear: contact.birthday?.startsWith('--') ?? false,
        anniversary: contact.anniversary ?? '',
        categories: contact.categories ?? [],
        photoDataUri: undefined,
        clearPhoto: false,
        note: contact.note ?? '',
      })
      setDetailsOpen(contactHasExtraDetails(contact))
      setPhotoPreviewSrc(contact.photos?.[0] ?? contact.photo)
      return
    }

    form.reset({
      bookId: defaultBookId ?? addressBooks[0]?.id ?? '',
      contactKind: 'individual',
      name: contactNameValue(prefill),
      firstName: prefill?.firstName ?? '',
      lastName: prefill?.lastName ?? '',
      middleName: prefill?.middleName ?? '',
      prefix: prefill?.prefix ?? '',
      suffix: prefill?.suffix ?? '',
      nickname: prefill?.nickname ?? '',
      organization: prefill?.organization ?? '',
      department: prefill?.department ?? '',
      jobTitle: prefill?.jobTitle ?? '',
      title: prefill?.title ?? '',
      emails: toEmailFieldArray(prefill),
      phoneNumbers: toPhoneFieldArray(prefill),
      addresses: toAddressFieldArray(prefill),
      urls: toFieldArray(prefill?.urls),
      impp: toFieldArray(prefill?.impp),
      birthday: prefill?.birthday ?? '',
      birthdayUnknownYear: false,
      anniversary: prefill?.anniversary ?? '',
      categories: prefill?.categories ?? [],
      photoDataUri: undefined,
      clearPhoto: false,
      note: prefill?.note ?? '',
    })
    setDetailsOpen(contactHasExtraDetails(prefill))
    setPhotoPreviewSrc(prefill?.photo)
  }, [
    formResetKey,
    isLoading,
    loadError,
    contact,
    prefill,
    form,
    revokePhotoObjectUrl,
    defaultBookId,
    addressBooks,
  ])

  const handlePhotoPick = () => {
    setIsFilePickerOpen(true)
    photoInputRef.current?.click()
    // Native file pickers do not always fire change on cancel; clear the guard on next focus.
    window.setTimeout(() => {
      const clearGuard = () => setIsFilePickerOpen(false)
      window.addEventListener('focus', clearGuard, { once: true })
    }, 0)
  }

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    setIsFilePickerOpen(false)
    if (!file) return

    try {
      if (file.size > CONTACT_PHOTO_MAX_BYTES) {
        setPhotoError(tErrors('file_too_large.string'))
        return
      }

      revokePhotoObjectUrl()
      const objectUrl = URL.createObjectURL(file)
      photoObjectUrlRef.current = objectUrl
      setPhotoPreviewSrc(objectUrl)
      setPhotoError(null)

      const dataUri = await readFileAsDataURL(file)
      photoPayloadRef.current = dataUri
    } catch {
      revokePhotoObjectUrl()
      setPhotoPreviewSrc(
        contact?.photos?.[0] ?? contact?.photo ?? prefill?.photo
      )
      photoPayloadRef.current = undefined
      setPhotoError(tErrors('generic.string'))
    } finally {
      input.value = ''
    }
  }

  const handleRemovePhoto = () => {
    revokePhotoObjectUrl()
    setPhotoPreviewSrc(undefined)
    photoPayloadRef.current = null
    setPhotoError(null)
  }

  const handleCategoryToggle = (name: string, checked: boolean) => {
    const current = form.getValues('categories')
    form.setValue(
      'categories',
      checked ? [...current, name] : current.filter((item) => item !== name)
    )
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    const photoPayload = photoPayloadRef.current
    const photoValues =
      photoPayload === null
        ? { photoDataUri: undefined, clearPhoto: true as const }
        : typeof photoPayload === 'string'
          ? { photoDataUri: photoPayload, clearPhoto: false as const }
          : { photoDataUri: undefined, clearPhoto: false as const }

    const typedName = values.name.trim()
    const email = values.emails
      .find((entry) => entry.value.trim())
      ?.value.trim()
    const phone = values.phoneNumbers
      .find((entry) => entry.value.trim())
      ?.value.trim()
    const organization = values.organization?.trim() ?? ''
    const split = typedName
      ? parseContactName(typedName)
      : {
          firstName: email || phone || organization,
          lastName: '',
        }

    await onSubmit(
      {
        ...values,
        ...photoValues,
        firstName: split.firstName,
        lastName: split.lastName,
      },
      contact?.id
    )
    onClose()
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isFilePickerOpen) return
        if (!next) onClose()
      }}
    >
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
              <p className="text-destructive text-sm">
                {t('load_error.title.string')}
              </p>
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
                {!isEdit && addressBooks.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="bookId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('fields.address_book.string')}</FormLabel>
                        <Select
                          value={field.value || addressBooks[0]?.id}
                          onValueChange={field.onChange}
                          disabled={addressBooks.length < 2}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="contact-book-select">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {addressBooks.map((book) => (
                              <SelectItem key={book.id} value={book.id}>
                                {book.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}
                {submitError && (
                  <p
                    className="text-destructive text-sm"
                    data-testid="contact-form-submit-error"
                  >
                    {submitError}
                  </p>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePhotoPick}
                      aria-label={
                        photoPreviewSrc
                          ? t('photo_change.string')
                          : t('photo_upload.string')
                      }
                      className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {photoPreviewSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element -- data: URL preview, not a static asset
                        <img
                          src={photoPreviewSrc}
                          alt=""
                          className="ring-border h-16 w-16 rounded-full object-cover ring-2"
                          data-testid="contact-photo-preview"
                        />
                      ) : (
                        <span className="bg-muted/50 flex h-16 w-16 items-center justify-center rounded-full border border-dashed">
                          <UserRound
                            className="text-muted-foreground h-7 w-7"
                            aria-hidden
                          />
                        </span>
                      )}
                    </button>
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/tiff"
                      className="hidden"
                      data-testid="contact-photo-input"
                      onChange={handlePhotoChange}
                    />
                    {photoPreviewSrc && (
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
                    name="name"
                    render={({ field }) => (
                      <FormItem className="min-w-0 flex-1">
                        <FormLabel>{t('fields.name.string')}</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="name" />
                        </FormControl>
                        {form.formState.errors.name ? (
                          <p className="text-destructive text-[0.8rem] font-medium">
                            {t('identity_required.string')}
                          </p>
                        ) : null}
                      </FormItem>
                    )}
                  />
                </div>
                {photoError && (
                  <p className="text-destructive text-[0.8rem] font-medium">
                    {photoError}
                  </p>
                )}

                <div className="space-y-2">
                  <FormLabel>{t('emails.string')}</FormLabel>
                  {emailFields.fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`emails.${index}.value`}
                        render={({ field: emailField }) => (
                          <FormItem className="min-w-0 flex-1">
                            <FormControl>
                              <Input
                                {...emailField}
                                type="email"
                                autoComplete="email"
                                aria-label={t('emails.string')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {emailFields.fields.length > 1 && (
                        <>
                          <FormField
                            control={form.control}
                            name={`emails.${index}.type`}
                            render={({ field: typeField }) => (
                              <FormItem className="w-28 shrink-0">
                                <Select
                                  value={typeField.value ?? '_none'}
                                  onValueChange={typeField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={t('fields.type.string')}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {emailTypeOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option === '_none'
                                          ? t('fields.type_default.string')
                                          : t(
                                              `fields.email_type_${option}.string`
                                            )}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`emails.${index}.pref`}
                            render={({ field: prefField }) => (
                              <FormItem className="flex shrink-0 items-center gap-2 pt-2">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(prefField.value)}
                                    onCheckedChange={prefField.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0 font-normal">
                                  {t('fields.pref.string')}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
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
                    onClick={() =>
                      emailFields.append({
                        value: '',
                        type: '_none',
                        pref: false,
                      })
                    }
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
                          <FormItem className="min-w-0 flex-1">
                            <FormControl>
                              <Input
                                {...phoneField}
                                type="tel"
                                autoComplete="tel"
                                aria-label={t('phone_numbers.string')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {phoneFields.fields.length > 1 && (
                        <>
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.type`}
                            render={({ field: typeField }) => (
                              <FormItem className="w-28 shrink-0">
                                <Select
                                  value={typeField.value ?? '_none'}
                                  onValueChange={typeField.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={t('fields.type.string')}
                                      />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {phoneTypeOptions.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option === '_none'
                                          ? t('fields.type_default.string')
                                          : t(
                                              `fields.phone_type_${option}.string`
                                            )}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`phoneNumbers.${index}.pref`}
                            render={({ field: prefField }) => (
                              <FormItem className="flex shrink-0 items-center gap-2 pt-2">
                                <FormControl>
                                  <Checkbox
                                    checked={Boolean(prefField.value)}
                                    onCheckedChange={prefField.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="!mt-0 font-normal">
                                  {t('fields.pref.string')}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </>
                      )}
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
                    onClick={() =>
                      phoneFields.append({
                        value: '',
                        type: '_none',
                        pref: false,
                      })
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {t('add_phone.string')}
                  </Button>
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

                <Collapsible
                  open={detailsOpen}
                  onOpenChange={setDetailsOpen}
                  className="space-y-4"
                >
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      {t('more_details.string')}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('fields.middle_name.string')}
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.nickname.string')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prefix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.prefix.string')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suffix"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.suffix.string')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('fields.department.string')}
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('fields.role.string')}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormLabel>{t('addresses.string')}</FormLabel>
                      {addressFields.fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-2 rounded-md border p-3"
                        >
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.street`}
                              render={({ field: streetField }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>
                                    {t('fields.street.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...streetField}
                                      autoComplete="street-address"
                                    />
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
                                  <FormLabel>
                                    {t('fields.city.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...cityField}
                                      autoComplete="address-level2"
                                    />
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
                                  <FormLabel>
                                    {t('fields.postal_code.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...postalField}
                                      autoComplete="postal-code"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.region`}
                              render={({ field: regionField }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('fields.region.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...regionField}
                                      autoComplete="address-level1"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.poBox`}
                              render={({ field: poBoxField }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('fields.po_box.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...poBoxField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`addresses.${index}.extended`}
                              render={({ field: extendedField }) => (
                                <FormItem className="sm:col-span-2">
                                  <FormLabel>
                                    {t('fields.extended.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input {...extendedField} />
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
                                  <FormLabel>
                                    {t('fields.country.string')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...countryField}
                                      autoComplete="country-name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
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
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          addressFields.append({ ...EMPTY_ADDRESS })
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
                                  <Input
                                    {...urlField}
                                    type="url"
                                    placeholder="https://"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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

                    <div className="space-y-2">
                      <FormLabel>{t('fields.impp.string')}</FormLabel>
                      {imppFields.fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                          <FormField
                            control={form.control}
                            name={`impp.${index}.value`}
                            render={({ field: imppField }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    {...imppField}
                                    placeholder="xmpp:user@example.com"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 shrink-0"
                            onClick={() => imppFields.remove(index)}
                            aria-label={t('remove_field.string')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imppFields.append({ value: '' })}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        {t('add_impp.string')}
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

                    <FormField
                      control={form.control}
                      name="birthdayUnknownYear"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                field.onChange(checked === true)
                              }
                            />
                          </FormControl>
                          <FormLabel>
                            {t('fields.birthday_unknown_year.string')}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="anniversary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('fields.anniversary.string')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {categoryOptions.length > 0 && (
                      <div className="space-y-2">
                        <FormLabel>{t('labels.string')}</FormLabel>
                        <div className="flex flex-wrap gap-3">
                          {categoryOptions.map((category) => (
                            <label
                              key={category.name}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Checkbox
                                checked={selectedCategories.includes(
                                  category.name
                                )}
                                onCheckedChange={(checked) =>
                                  handleCategoryToggle(
                                    category.name,
                                    checked === true
                                  )
                                }
                              />
                              <span>{category.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

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
                  </CollapsibleContent>
                </Collapsible>
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
