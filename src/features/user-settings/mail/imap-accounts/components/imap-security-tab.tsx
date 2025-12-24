'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import type { ImapAccountDetail } from '../types'
import { imapAccountCreateSchema, imapAccountEditSchema } from './imap-schema'

type ImapCreateValues = z.infer<typeof imapAccountCreateSchema>
type ImapEditValues = z.infer<typeof imapAccountEditSchema>

interface ImapSecurityTabProps {
  form: UseFormReturn<ImapCreateValues> | UseFormReturn<ImapEditValues>
  mode: 'edit' | 'new'
  accountData?: ImapAccountDetail
}

function ImapSecurityTabEdit({
  accountData,
}: {
  accountData: ImapAccountDetail
}) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')

  return (
    <div className="space-y-8">
      {/* SECTION S/MIME CERTIFICATE */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {t('sections.certificate.string')}
        </h3>

        {/* Certificate Name */}
        <FormItem>
          <FormLabel>{t('labels.certificateName.string')}</FormLabel>
          <FormControl>
            <Input
              value={accountData.certificateName ?? ''}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </FormControl>
        </FormItem>
      </div>
    </div>
  )
}

function ImapSecurityTabNew({
  form,
}: {
  form: UseFormReturn<ImapCreateValues>
}) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')

  return (
    <div className="space-y-8">
      {/* SECTION S/MIME CERTIFICATE */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {t('sections.certificate.string')}
        </h3>

        {/* Certificate Name */}
        <FormField
          control={form.control}
          name="certificateName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.certificateName.string')}</FormLabel>
              <FormDescription className="text-muted-foreground">
                {t('description.certificateName.string')}
              </FormDescription>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('placeholders.certificateName.string')}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function ImapSecurityTab({ form, mode, accountData }: ImapSecurityTabProps) {
  if (mode === 'edit' && accountData) {
    return <ImapSecurityTabEdit accountData={accountData} />
  }
  return <ImapSecurityTabNew form={form as UseFormReturn<ImapCreateValues>} />
}

export default ImapSecurityTab
