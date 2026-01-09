'use client'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
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
  const [showCertificatePassword, setShowCertificatePassword] = useState(false)

  return (
    <div className="space-y-8">
      {/* SECTION S/MIME CERTIFICATE */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {t('sections.certificate.string')}
        </h3>

        {/* Certificate File Upload */}
        <FormField
          control={form.control}
          name="certificateFile"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>{t('labels.certificateFile.string')}</FormLabel>
              <FormDescription className="text-muted-foreground">
                {t('description.certificateFile.string')}
              </FormDescription>
              <FormControl>
                <Input
                  {...field}
                  type="file"
                  accept=".p12,.pfx,.pem,.crt,.cer"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    onChange(file)
                  }}
                  className="file:bg-primary file:text-primary-foreground file:hover:bg-primary/90 h-auto cursor-pointer file:mr-4 file:rounded-md file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
                />
              </FormControl>
              {value && (
                <p className="text-muted-foreground text-sm">
                  {t('labels.selectedFile.string')} {value.name}
                </p>
              )}
            </FormItem>
          )}
        />

        {/* Certificate Import Password */}
        <FormField
          control={form.control}
          name="certificatePassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.certificatePassword.string')}</FormLabel>
              <FormDescription className="text-muted-foreground">
                {t('description.certificatePassword.string')}
              </FormDescription>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showCertificatePassword ? 'text' : 'password'}
                    placeholder={t('placeholders.certificatePassword.string')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowCertificatePassword(!showCertificatePassword)
                    }
                    className="text-muted-foreground hover:text-foreground absolute top-0 right-0 flex h-full items-center pr-3"
                    aria-label={
                      showCertificatePassword
                        ? t('aria.hide_password.string')
                        : t('aria.show_password.string')
                    }
                  >
                    {showCertificatePassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
