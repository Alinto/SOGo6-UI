'use client'

import { Button } from '@/components/ui/button'
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
import type {
  ContactMember,
  VCard,
} from '@/features/address_books/address-books-types'
import { getContactDisplayName } from '@/features/address_books/utils/contact-list'
import {
  getMemberDisplayLabel,
  isIndividualContact,
} from '@/features/address_books/utils/distribution-list'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { memo, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

const EMPTY_MEMBER_IDS: string[] = []

const distributionListFormSchema = z.object({
  name: z.string().min(1).max(200),
  note: z.string().max(5000).optional(),
  memberContactIds: z.array(z.string()).min(1, { message: 'required' }),
})

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
  submitError?: string | null
  onClose: () => void
  onSubmit: (
    values: DistributionListFormValues,
    listId?: string
  ) => Promise<void>
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
  submitError,
  onClose,
  onSubmit,
}: DistributionListFormProps) {
  const t = useTranslations('DISTRIBUTION_LIST_FORM')
  const tContact = useTranslations('CONTACT_FORM')
  const isEdit = isEditMode || Boolean(list?.id)
  const [memberQuery, setMemberQuery] = useState('')
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setMemberQuery('')
  }

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
    },
  })

  const selectedMemberIds =
    useWatch({
      control: form.control,
      name: 'memberContactIds',
    }) ?? EMPTY_MEMBER_IDS

  useEffect(() => {
    if (!open || isLoading || loadError) return

    if (list) {
      const memberContactIds = (list.members ?? [])
        .map((member) => member.contactId)
        .filter((id): id is string => Boolean(id))
      form.reset({
        name: list.firstName,
        note: list.note ?? '',
        memberContactIds,
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
    })
  }, [open, list, prefillMembers, form, isLoading, loadError])

  const memberLabel = (contactId: string) => {
    const contact = individualContacts.find((item) => item.id === contactId)
    if (contact) return getContactDisplayName(contact)
    const prefill = prefillMembers?.find(
      (member) => member.contactId === contactId
    )
    return prefill ? getMemberDisplayLabel(prefill) : contactId
  }

  const memberQueryNormalized = memberQuery.trim().toLowerCase()
  const visibleContacts = individualContacts.filter((contact) => {
    if (selectedMemberIds.includes(contact.id)) return false
    if (!memberQueryNormalized) return true
    const name = getContactDisplayName(contact).toLowerCase()
    const email = (contact.emails?.[0] ?? '').toLowerCase()
    return (
      name.includes(memberQueryNormalized) ||
      email.includes(memberQueryNormalized)
    )
  })
  const unselectedCount = individualContacts.filter(
    (contact) => !selectedMemberIds.includes(contact.id)
  ).length

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
          <div
            className="flex justify-center py-12"
            data-testid="list-form-loading"
          >
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        )}

        {loadError && !isLoading && (
          <div className="space-y-4 py-4" data-testid="list-form-load-error">
            <p className="text-destructive text-sm">
              {tContact('load_error.title.string')}
            </p>
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
              {!isEdit && (
                <p className="text-muted-foreground text-sm">
                  {t('intro.string')}
                </p>
              )}
              {submitError && (
                <p
                  className="text-destructive text-sm"
                  data-testid="list-form-submit-error"
                >
                  {submitError}
                </p>
              )}
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
                {selectedMemberIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMemberIds.map((contactId) => {
                      const label = memberLabel(contactId)
                      return (
                        <span
                          key={contactId}
                          className="bg-muted inline-flex max-w-full items-center gap-1 rounded-full py-0.5 pr-1 pl-2 text-xs"
                        >
                          <span className="truncate">{label}</span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                            aria-label={t('remove_member.string', {
                              name: label,
                            })}
                            onClick={() => toggleMember(contactId, false)}
                          >
                            <X className="h-3 w-3" aria-hidden />
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
                <Input
                  value={memberQuery}
                  onChange={(event) => setMemberQuery(event.target.value)}
                  placeholder={t('search_members.string')}
                  aria-label={t('search_members.string')}
                />
                <ScrollArea className="h-48 rounded-md border p-2">
                  {visibleContacts.length === 0 ? (
                    <p className="text-muted-foreground px-2 py-4 text-center text-xs">
                      {individualContacts.length === 0
                        ? t('no_contacts.string')
                        : unselectedCount === 0
                          ? t('all_contacts_added.string')
                          : t('no_matching_contacts.string')}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {visibleContacts.map((contact) => {
                        const email = contact.emails?.[0]
                        const label = getContactDisplayName(contact)
                        return (
                          <button
                            key={contact.id}
                            type="button"
                            className="hover:bg-accent/50 flex w-full items-start gap-2 rounded-md p-2 text-left"
                            aria-label={t('add_member.string', { name: label })}
                            onClick={() => toggleMember(contact.id, true)}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">
                                {label}
                              </span>
                              {email && (
                                <span className="text-muted-foreground block truncate text-xs">
                                  {email}
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
                {form.formState.errors.memberContactIds && (
                  <p className="text-destructive text-sm">
                    {t('members_required.string')}
                  </p>
                )}
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
