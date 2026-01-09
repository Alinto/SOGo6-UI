'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import type { ImapAccountDetail } from '../types'
import { imapAccountCreateSchema, imapAccountEditSchema } from './imap-schema'

type ImapCreateValues = z.infer<typeof imapAccountCreateSchema>
type ImapEditValues = z.infer<typeof imapAccountEditSchema>

interface ImapSettingsTabProps {
  form: UseFormReturn<ImapCreateValues> | UseFormReturn<ImapEditValues>
  mode: 'edit' | 'new'
  accountData?: ImapAccountDetail
}

function ImapSettingsTabEdit({
  form,
  accountData,
}: {
  form: UseFormReturn<ImapEditValues>
  accountData: ImapAccountDetail
}) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')

  return (
    <div className="space-y-8">
      {/* SECTION IMAP */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.imap.string')}</h3>

        {/* ROW 1 - IMAP Server + Port */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <FormItem>
            <FormLabel>{t('labels.imapServer.string')}</FormLabel>
            <FormControl>
              <Input
                value={accountData.imapServer}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </FormControl>
          </FormItem>

          <FormItem className="w-full md:w-32">
            <FormLabel>{t('labels.imapPort.string')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={65535}
                value={accountData.imapPort}
                readOnly
                className="bg-muted w-full cursor-not-allowed"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* IMAP Encryption - HORIZONTAL */}
        <FormItem className="space-y-3">
          <FormLabel>{t('labels.imapEncryption.string')}</FormLabel>
          <FormControl>
            <RadioGroup
              value={accountData.imapEncryption}
              disabled
              className="mt-2 flex flex-row gap-6"
            >
              {(['none', 'ssl', 'tls'] as const).map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`imap-${value}`} disabled />
                  <Label
                    htmlFor={`imap-${value}`}
                    className="cursor-not-allowed opacity-60"
                  >
                    {t(`encryption.${value}.string`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION SMTP */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.smtp.string')}</h3>

        {/* ROW 2 - SMTP Server + Port */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <FormItem>
            <FormLabel>{t('labels.smtpServer.string')}</FormLabel>
            <FormControl>
              <Input
                value={accountData.smtpServer}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </FormControl>
          </FormItem>

          <FormItem className="w-full md:w-32">
            <FormLabel>{t('labels.smtpPort.string')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={65535}
                value={accountData.smtpPort}
                readOnly
                className="bg-muted w-full cursor-not-allowed"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* SMTP Encryption - HORIZONTAL */}
        <FormItem className="space-y-3">
          <FormLabel>{t('labels.smtpEncryption.string')}</FormLabel>
          <FormControl>
            <RadioGroup
              value={accountData.smtpEncryption}
              disabled
              className="mt-2 flex flex-row gap-6"
            >
              {(['none', 'ssl', 'tls'] as const).map((value) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`smtp-${value}`} disabled />
                  <Label
                    htmlFor={`smtp-${value}`}
                    className="cursor-not-allowed opacity-60"
                  >
                    {t(`encryption.${value}.string`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </FormItem>

        {/* SMTP Authentication */}
        <FormItem className="flex flex-row items-center space-y-0 space-x-3">
          <FormControl>
            <Checkbox checked={accountData.smtpAuth} disabled id="smtp-auth" />
          </FormControl>
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="smtp-auth"
              className="cursor-not-allowed font-normal opacity-60"
            >
              {t('labels.smtpAuth.string')}
            </Label>
          </div>
        </FormItem>
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION IDENTITY */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.identity.string')}</h3>

        {/* Username */}
        <FormItem>
          <FormLabel>{t('labels.username.string')}</FormLabel>
          <FormControl>
            <Input
              type="email"
              value={accountData.username}
              readOnly
              className="bg-muted cursor-not-allowed"
            />
          </FormControl>
        </FormItem>

        {/* Use Default Identity */}
        <FormItem className="flex flex-row items-start space-y-0 space-x-3">
          <FormControl>
            <Checkbox
              checked={accountData.useDefaultIdentity}
              disabled
              id="use-default-identity"
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="use-default-identity"
              className="cursor-not-allowed font-normal opacity-60"
            >
              {t('labels.useDefaultIdentity.string')}
            </Label>
            <FormDescription className="text-muted-foreground">
              {t('description.useDefaultIdentity.string')}
            </FormDescription>
          </div>
        </FormItem>
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION PRÉFÉRENCES */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {t('sections.preferences.string')}
        </h3>

        {/* Read Receipts  */}
        <FormField
          control={form.control}
          name="readReceipts"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('labels.readReceipts.string')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="mt-2 flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="receipts-never" />
                    <Label
                      htmlFor="receipts-never"
                      className="cursor-pointer font-normal"
                    >
                      {t('readReceipts.never.string')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selective" id="receipts-selective" />
                    <Label
                      htmlFor="receipts-selective"
                      className="cursor-pointer font-normal"
                    >
                      {t('readReceipts.selective.string')}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function ImapSettingsTabNew({
  form,
}: {
  form: UseFormReturn<ImapCreateValues>
}) {
  const t = useTranslations('US_MAIL_IMAP_ACCOUNTS')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-8">
      {/* SECTION IMAP */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.imap.string')}</h3>

        {/* ROW 1 - IMAP Server + Port */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <FormItem>
            <FormLabel>{t('labels.imapServer.string')}</FormLabel>
            <FormControl>
              <Input
                {...form.register('imapServer')}
                placeholder={t('placeholders.imapServer.string')}
              />
            </FormControl>
          </FormItem>

          <FormItem className="w-full md:w-32">
            <FormLabel>{t('labels.imapPort.string')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={65535}
                {...form.register('imapPort', { valueAsNumber: true })}
                placeholder="993"
                className="w-full"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* IMAP Encryption - HORIZONTAL */}
        <FormField
          control={form.control}
          name="imapEncryption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('labels.imapEncryption.string')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="mt-2 flex flex-row gap-6"
                >
                  {(['none', 'ssl', 'tls'] as const).map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`imap-${value}`}
                        className="cursor-pointer"
                      />
                      <Label
                        htmlFor={`imap-${value}`}
                        className="cursor-pointer"
                      >
                        {t(`encryption.${value}.string`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION SMTP */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.smtp.string')}</h3>

        {/* ROW 2 - SMTP Server + Port */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <FormItem>
            <FormLabel>{t('labels.smtpServer.string')}</FormLabel>
            <FormControl>
              <Input
                {...form.register('smtpServer')}
                placeholder={t('placeholders.smtpServer.string')}
              />
            </FormControl>
          </FormItem>

          <FormItem className="w-full md:w-32">
            <FormLabel>{t('labels.smtpPort.string')}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                max={65535}
                {...form.register('smtpPort', { valueAsNumber: true })}
                placeholder="587"
                className="w-full"
              />
            </FormControl>
          </FormItem>
        </div>

        {/* SMTP Encryption - HORIZONTAL */}
        <FormField
          control={form.control}
          name="smtpEncryption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('labels.smtpEncryption.string')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="mt-2 flex flex-row gap-6"
                >
                  {(['none', 'ssl', 'tls'] as const).map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={value}
                        id={`smtp-${value}`}
                        className="cursor-pointer"
                      />
                      <Label
                        htmlFor={`smtp-${value}`}
                        className="cursor-pointer"
                      >
                        {t(`encryption.${value}.string`)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        {/* SMTP Authentication - Sur sa propre ligne */}
        <FormField
          control={form.control}
          name="smtpAuth"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  id="smtp-auth"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="smtp-auth"
                  className="cursor-pointer font-normal"
                >
                  {t('labels.smtpAuth.string')}
                </Label>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION IDENTITÉ */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">{t('sections.identity.string')}</h3>

        {/* Username */}
        <FormItem>
          <FormLabel>{t('labels.username.string')}</FormLabel>
          <FormControl>
            <Input
              type="email"
              {...form.register('username')}
              placeholder={t('placeholders.username.string')}
            />
          </FormControl>
        </FormItem>

        {/* Password - SEULEMENT en mode NEW */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.password.string')}</FormLabel>
              <FormDescription className="text-muted-foreground">
                {t('description.password.string')}
              </FormDescription>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('placeholders.password.string')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-0 right-0 flex h-full items-center pr-3"
                    aria-label={
                      showPassword
                        ? t('aria.hide_password.string')
                        : t('aria.show_password.string')
                    }
                  >
                    {showPassword ? (
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

        {/* Use Default Identity */}
        <FormField
          control={form.control}
          name="useDefaultIdentity"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  id="use-default-identity"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="use-default-identity"
                  className="cursor-pointer font-normal"
                >
                  {t('labels.useDefaultIdentity.string')}
                </Label>
                <FormDescription className="text-muted-foreground">
                  {t('description.useDefaultIdentity.string')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* SEPARATOR */}
      <Separator />

      {/* SECTION PRÉFÉRENCES */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">
          {t('sections.preferences.string')}
        </h3>

        {/* Read Receipts - TOUJOURS ÉDITABLE */}
        <FormField
          control={form.control}
          name="readReceipts"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('labels.readReceipts.string')}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="mt-2 flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="receipts-never" />
                    <Label
                      htmlFor="receipts-never"
                      className="cursor-pointer font-normal"
                    >
                      {t('readReceipts.never.string')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="selective" id="receipts-selective" />
                    <Label
                      htmlFor="receipts-selective"
                      className="cursor-pointer font-normal"
                    >
                      {t('readReceipts.selective.string')}
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

function ImapSettingsTab({ form, mode, accountData }: ImapSettingsTabProps) {
  if (mode === 'edit' && accountData) {
    return (
      <ImapSettingsTabEdit
        form={form as UseFormReturn<ImapEditValues>}
        accountData={accountData}
      />
    )
  }
  return <ImapSettingsTabNew form={form as UseFormReturn<ImapCreateValues>} />
}

export default ImapSettingsTab
