'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import type { ContactMember, VCard } from '@/features/address_books/address-books-types'
import { getContactDisplayName } from '@/features/address_books/utils/contact-list'
import { isIndividualContact } from '@/features/address_books/utils/distribution-list'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

const distributionListFormSchema = z
  .object({
    name: z.string().min(1).max(200),
    note: z.string().max(5000).optional(),
    memberContactIds: z.array(z.string()),
    manualEmails: z.array(
      z.object({ value: z.string().email().or(z.literal('')) })
    ),
  })
  .refine(
    (data) =>
      data.memberContactIds.length > 0 ||
      data.manualEmails.some((entry) => entry.value.trim()),
    { path: ['memberContactIds'], message: 'required' }
  )

export type DistributionListFormValues = z.infer<
  typeof distributionListFormSchema
>

type DistributionListFormProps = {
  open: boolean
  isEditMode?: boolean
  isLoading?: boolean
  loadError?: boolean
  isSubmitting?: boolean
  list?: VCard | null
  prefillMembers?: ContactMember[] | null
  bookContacts: VCard[]
  onClose: () => void
  onSubmit: (values: DistributionListFormValues, listId?: string) => Promise<void>
}

function DistributionListForm({
  open,
  isEditMode = false,
  isLoading = false,
  loadError = false,
  isSubmitting = false,
  list,
  prefillMembers,
  bookContacts,
  onClose,
  onSubmit,
}: DistributionListFormProps) {
  const t = useTranslations('DISTRIBUTION_LIST_FORM')
  const tContact = useTranslations('CONTACT_FORM')
  const isEdit = isEditMode || Boolean(list?.id)

  const individualContacts = useMemo(
    () => bookContacts.filter(isIndividualContact),
    [bookContacts]
  )

  const form = useForm<DistributionListFormValues>({
    resolver: zodResolver(distributionListFormSchema),
    defaultValues: {
      name: '',
      note: '',
      memberContactIds: [],
      manualEmails: [{ value: '' }],
    },
  })

  const manualEmailFields = useFieldArray({
    control: form.control,
    name: 'manualEmails',
  })

  const selectedMemberIds = useWatch({
    control: form.control,
    name: 'memberContactIds',
  }) ?? []

  useEffect(() => {
    if (!open || isLoading || loadError) return

    if (list) {
      const memberContactIds = (list.members ?? [])
        .map((member) => member.contactId)
        .filter((id): id is string => Boolean(id))
      const manualEmails = (list.members ?? [])
        .filter((member) => !member.contactId && member.email)
        .map((member) => ({ value: member.email }))

      form.reset({
        name: list.firstName,
        note: list.note ?? '',
        memberContactIds,
        manualEmails: manualEmails.length ? manualEmails : [{ value: '' }],
      })
      return
    }

    const prefillIds = (prefillMembers ?? [])
      .map((member) => member.contactId)
      .filter((id): id is string => Boolean(id))

    form.reset({
      name: '',
      note: '',
      memberContactIds: prefillIds,
      manualEmails: [{ value: '' }],
    })
  }, [open, list, prefillMembers, form, isLoading, loadError])

  const toggleMember = (contactId: string, checked: boolean) => {
    const current = form.getValues('memberContactIds')
    form.setValue(
      'memberContactIds',
      checked
        ? [...current, contactId]
        : current.filter((id) => id !== contactId),
      { shouldValidate: true }
    )
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values, list?.id)
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('edit_list.string') : t('new_list.string')}
          </DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-12" data-testid="list-form-loading">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        {loadError && !isLoading && (
          <div className="space-y-4 py-4" data-testid="list-form-load-error">
            <p className="text-destructive text-sm">{tContact('load_error.title.string')}</p>
            <p className="text-muted-foreground text-sm">
              {tContact('load_error.description.string')}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {tContact('cancel.string')}
              </Button>
            </DialogFooter>
          </div>
        )}

        {!isLoading && !loadError && (
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.name.string')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.note.string')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>{t('members.string')}</FormLabel>
              <p className="text-muted-foreground text-xs">
                {t('members_selected.string', {
                  number: selectedMemberIds.length,
                })}
              </p>
              <ScrollArea className="h-48 rounded-md border p-2">
                <div className="space-y-2">
                  {individualContacts.map((contact) => {
                    const checked = selectedMemberIds.includes(contact.id)
                    const email = contact.emails?.[0]
                    return (
                      <label
                        key={contact.id}
                        className="hover:bg-accent/50 flex cursor-pointer items-start gap-2 rounded-md p-2"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleMember(contact.id, value === true)
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {getContactDisplayName(contact)}
                          </span>
                          {email && (
                            <span className="text-muted-foreground block truncate text-xs">
                              {email}
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </ScrollArea>
              {form.formState.errors.memberContactIds && (
                <p className="text-destructive text-sm">
                  {t('members_required.string')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel>{t('manual_emails.string')}</FormLabel>
              {manualEmailFields.fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <FormField
                    control={form.control}
                    name={`manualEmails.${index}.value`}
                    render={({ field: emailField }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input {...emailField} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {manualEmailFields.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-0.5 shrink-0"
                      onClick={() => manualEmailFields.remove(index)}
                      aria-label={t('remove_email.string')}
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
                onClick={() => manualEmailFields.append({ value: '' })}
              >
                <Plus className="mr-1 h-4 w-4" />
                {t('add_email.string')}
              </Button>
            </div>

            <DialogFooter>
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
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default memo(DistributionListForm)
