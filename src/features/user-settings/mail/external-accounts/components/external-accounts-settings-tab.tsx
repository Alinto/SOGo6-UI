'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import SelectForm from '@/components/ui/forms/select-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { CustomEditorCore } from '@/features/mails/components/compose/editor-core'
import { useController, useFieldArray, UseFormReturn } from 'react-hook-form'
import {
  FAKE_PASSWORD_SENTINEL,
  MAIL_OUTGOING,
  MAIL_SERVER,
  MODE_CREATE,
  MODE_EDIT,
} from '../external-accounts-utils'

import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  Mailbox,
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
} from '@/features/user-settings/mail/external-accounts/store/mailboxes-api-types'
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pen,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { schemaType } from './external-accounts-schema'

interface ExternalAccountSettingsTabProps {
  form: UseFormReturn<schemaType>
  mode: typeof MODE_EDIT | typeof MODE_CREATE
  mailboxData?: Mailbox
}

// ---------------------------------------------------------------------------
// SectionSeparator
// ---------------------------------------------------------------------------
function SectionSeparator({
  label,
  description,
}: {
  label: string
  description?: string
}) {
  return (
    <div className="relative my-12">
      <Separator />
      <span className="bg-background text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 px-2 text-xs font-medium tracking-wider uppercase">
        <h3 className="text-lg font-medium">{label}</h3>
        {description && (
          <Label className="cursor-pointer font-normal">{description}</Label>
        )}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PasswordField — handles the fake-password sentinel for edit mode
// ---------------------------------------------------------------------------
interface PasswordFieldProps {
  value: string
  onChange: (value: string) => void
  isEdit: boolean
  showPassword: boolean
  onTogglePassword: () => void
  placeholder?: string
  sameAsIncoming?: boolean
  onToggleSameAsIncoming?: () => void
  showSameAsIncoming?: boolean
}

function PasswordField({
  value,
  onChange,
  isEdit,
  showPassword,
  onTogglePassword,
  placeholder = '••••••••',
  sameAsIncoming,
  onToggleSameAsIncoming,
  showSameAsIncoming = false,
}: PasswordFieldProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')

  // The sentinel represents the untouched API password — it must never be
  // revealed in clear text. Once the user types something new, normal
  // show/hide behaviour applies.
  const isSentinel = isEdit && value === FAKE_PASSWORD_SENTINEL
  const displayValue = isSentinel ? '' : value
  const canToggleVisibility = !isSentinel // eye button only when user has typed

  const handleFocus = () => {
    if (isSentinel) onChange('')
  }

  const handleBlur = () => {
    // Nothing typed → restore sentinel so the field stays "untouched"
    if (isEdit && value === '') onChange(FAKE_PASSWORD_SENTINEL)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // Sentinel is always masked; user-typed value follows the toggle
          type={canToggleVisibility && showPassword ? 'text' : 'password'}
          placeholder={isSentinel ? '••••••••' : placeholder}
          disabled={sameAsIncoming}
          className="pr-10"
        />
        {/* Eye toggle: always shown, but only functional once sentinel is cleared */}
        <button
          type="button"
          onClick={canToggleVisibility ? onTogglePassword : undefined}
          className={`absolute top-0 right-0 flex h-full items-center pr-3 ${
            canToggleVisibility
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-muted-foreground/30 cursor-default'
          }`}
          tabIndex={canToggleVisibility ? 0 : -1}
          aria-hidden={!canToggleVisibility}
        >
          {showPassword && canToggleVisibility ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {showSameAsIncoming && onToggleSameAsIncoming && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="smtp-same-as-imap"
            checked={!!sameAsIncoming}
            onCheckedChange={onToggleSameAsIncoming}
          />
          <Label
            htmlFor="smtp-same-as-imap"
            className="cursor-pointer text-xs font-normal opacity-70"
          >
            {t('labels.sameAsIncoming')}
          </Label>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ServerSection — reused for IMAP and SMTP
// ---------------------------------------------------------------------------
interface ServerSectionProps {
  form: UseFormReturn<schemaType>
  prefix: typeof MAIL_SERVER | typeof MAIL_OUTGOING
  isEdit: boolean
  showPassword: boolean
  onTogglePassword: () => void
  sameAsIncoming?: boolean
  onToggleSameAsIncoming?: () => void
  mode: typeof MODE_EDIT | typeof MODE_CREATE
}

function ServerSection({
  form,
  prefix,
  isEdit,
  showPassword,
  onTogglePassword,
  sameAsIncoming,
  onToggleSameAsIncoming,
  mode,
}: ServerSectionProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const isImap = prefix === MAIL_SERVER
  const isSmtp = prefix === MAIL_OUTGOING

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 md:space-x-10">
        <FormField
          control={form.control}
          name={`${prefix}.server`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.server.string')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder={isImap ? 'imap.example.com' : 'smtp.example.com'}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.port`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.port.string')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min={1}
                  max={65535}
                  placeholder={isImap ? '993' : '587'}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    e.target.value === ''
                      ? field.onChange(undefined)
                      : field.onChange(Number(e.target.value))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:space-x-10">
        <FormField
          control={form.control}
          name={`${prefix}.encryption`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.encryption.string')}</FormLabel>
              <FormControl>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    {
                      value: SOCKET_ENC_EXPLICIT_TLS,
                      label: SOCKET_ENC_EXPLICIT_TLS,
                    },
                    {
                      value: SOCKET_ENC_IMPLICIT_TLS,
                      label: SOCKET_ENC_IMPLICIT_TLS,
                    },
                    { value: SOCKET_ENC_PLAIN, label: SOCKET_ENC_PLAIN },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.auth_mech`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.authType.string')}</FormLabel>
              <FormControl>
                <SelectForm
                  onValueChange={field.onChange}
                  value={field.value}
                  options={[
                    { value: AUTHMECH_PLAIN, label: AUTHMECH_PLAIN },
                    { value: AUTHMECH_LOGIN, label: AUTHMECH_LOGIN },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:space-x-10">
        <FormField
          control={form.control}
          name={`${prefix}.username`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.username.string')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="user@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`${prefix}.password`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.password.string')}</FormLabel>
              <FormControl>
                <PasswordField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  isEdit={isEdit}
                  showPassword={showPassword}
                  onTogglePassword={onTogglePassword}
                  showSameAsIncoming={isSmtp && mode === MODE_CREATE}
                  sameAsIncoming={sameAsIncoming}
                  onToggleSameAsIncoming={onToggleSameAsIncoming}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// IdentityFields — the inner form fields shared by all identity cards
// ---------------------------------------------------------------------------
const emptyIdentity = {
  name: '',
  mail: '',
  replyTo: '',
  isDefault: false,
  signatures: {},
}

function IdentityFields({
  form,
  index,
  identityCount,
  onSetDefault,
}: {
  form: UseFormReturn<schemaType>
  index: number
  identityCount: number
  onSetDefault: () => void
}) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 md:space-x-10">
        <FormField
          control={form.control}
          name={`identities.${index}.name`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('labels.name')}</FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="John Doe" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`identities.${index}.mail`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('labels.email')}</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="user@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`identities.${index}.replyTo`}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('labels.replyTo')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="noreply@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* isDefault — only shown when there are multiple identities */}
      {identityCount > 1 && (
        <FormField
          control={form.control}
          name={`identities.${index}.isDefault`}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-y-0 space-x-3">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    if (checked) onSetDefault()
                  }}
                  disabled={field.value && identityCount === 1}
                  id={`use-default-identity-${index}`}
                />
              </FormControl>
              <FormMessage />
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor={`use-default-identity-${index}`}
                  className="font-normal opacity-60"
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
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// SignatureEditor
// ---------------------------------------------------------------------------
function SignatureEditor({
  form,
  identityIndex,
}: {
  form: UseFormReturn<schemaType>
  identityIndex: number
}) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({})
  const [newKeyName, setNewKeyName] = useState('')

  const { field } = useController({
    control: form.control,
    name: `identities.${identityIndex}.signatures`,
  })

  const signatures: Record<string, string> = field.value ?? {}

  const toggleCollapse = (key: string) =>
    setCollapsedMap((prev) => ({ ...prev, [key]: !prev[key] }))

  const addSignature = () => {
    const trimmed = newKeyName.trim()
    if (!trimmed || trimmed in signatures) return
    field.onChange({ ...signatures, [trimmed]: '' })
    setNewKeyName('')
  }

  const removeSignature = (key: string) => {
    const updated = { ...signatures }
    delete updated[key]
    field.onChange(updated)
  }

  const updateContent = (key: string, content: string) => {
    field.onChange({ ...signatures, [key]: content })
  }

  return (
    <div className="space-y-3">
      <FormLabel>{t('labels.signatures')}</FormLabel>

      {Object.entries(signatures).map(([key, content]) => (
        <div key={key} className="border-border rounded-md border">
          <div className="bg-muted/30 flex items-center justify-between rounded-t-md px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full">
                <Pen className="h-3 w-3" />
              </div>
              <span className="text-sm font-medium">{key}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleCollapse(key)}
              >
                {collapsedMap[key] ? (
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                ) : (
                  <ChevronUp className="text-muted-foreground h-4 w-4" />
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeSignature(key)}
                title={t('labels.removeSignature')}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          </div>

          {!collapsedMap[key] && (
            <div className="border-border rounded-b-md border-t">
              <CustomEditorCore
                data={content}
                onChange={(newContent) => updateContent(key, newContent)} // Updates state on change
              />
            </div>
            // <Textarea
            //   value={content ?? ''}
            //   onChange={(e) => updateContent(key, e.target.value)}
            //   className="border-border min-h-32 w-full rounded-none rounded-b-md border-0 border-t px-3 py-2 text-sm focus-visible:ring-0"
            // />
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <Input
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder={t('placeholders.signatureName')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addSignature()
            }
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addSignature}
          disabled={!newKeyName.trim() || newKeyName.trim() in signatures}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('labels.addSignature')}
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// IdentityCard — single collapsible card, shared by both create & edit modes
// ---------------------------------------------------------------------------
interface IdentityCardProps {
  form: UseFormReturn<schemaType>
  index: number
  identityCount: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSetDefault: () => void
  onRemove: () => void
}

function IdentityCard({
  form,
  index,
  identityCount,
  isCollapsed,
  onToggleCollapse,
  onSetDefault,
  onRemove,
}: IdentityCardProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const identityName = form.watch(`identities.${index}.name`)
  const identityMail = form.watch(`identities.${index}.mail`)
  const isDefault = form.watch(`identities.${index}.isDefault`)

  const initials = (identityName || '?')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="border-border rounded-md border">
      {/* Header */}
      <div className="bg-muted/50 flex items-center justify-between rounded-t-md px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">
              {identityName || t('labels.newIdentity')}
            </span>
            <span className="text-muted-foreground text-xs">
              {identityMail || '—'}
            </span>
          </div>
          {isDefault && (
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-medium">
              {t('labels.default')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronDown className="text-muted-foreground h-4 w-4" />
            ) : (
              <ChevronUp className="text-muted-foreground h-4 w-4" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRemove}
            disabled={identityCount === 1}
            title={
              identityCount === 1
                ? t('labels.atLeastOneIdentity')
                : t('labels.removeIdentity')
            }
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="border-border space-y-4 border-t px-4 py-4">
          <IdentityFields
            form={form}
            index={index}
            identityCount={identityCount}
            onSetDefault={onSetDefault}
          />
          <SignatureEditor form={form} identityIndex={index} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ReceiptsEditor
// ---------------------------------------------------------------------------
function ReceiptsEditor({ form }: { form: UseFormReturn<schemaType> }) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const enabled = form.watch('receipts.enabled')

  const policyOptions = [
    { value: 'never', label: t('labels.receipts.never') },
    { value: 'always', label: t('labels.receipts.always') },
    { value: 'ask', label: t('labels.receipts.ask') },
  ]

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="receipts.enabled"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormControl>
              <RadioGroup
                value={field.value ? 'selective' : 'never'}
                onValueChange={(val) => field.onChange(val === 'selective')}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="receipts-never" />
                  <Label
                    htmlFor="receipts-never"
                    className="cursor-pointer font-normal"
                  >
                    {t('labels.receipts.neverSend')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selective" id="receipts-selective" />
                  <Label
                    htmlFor="receipts-selective"
                    className="cursor-pointer font-normal"
                  >
                    {t('labels.receipts.allowSome')}
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {enabled && (
        <div className="bg-muted/30 space-y-4 rounded-md border p-4">
          <FormField
            control={form.control}
            name="receipts.not_to_cc"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">
                  {t('labels.receipts.notToCc')}
                </FormLabel>
                <FormControl>
                  <SelectForm
                    value={field.value}
                    onValueChange={field.onChange}
                    options={policyOptions}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receipts.outside_domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">
                  {t('labels.receipts.outsideDomain')}
                </FormLabel>
                <FormControl>
                  <SelectForm
                    value={field.value}
                    onValueChange={field.onChange}
                    options={policyOptions}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receipts.other"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground text-xs">
                  {t('labels.receipts.other')}
                </FormLabel>
                <FormControl>
                  <SelectForm
                    value={field.value}
                    onValueChange={field.onChange}
                    options={policyOptions}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ExternalAccountSettingsTab — main component
// ---------------------------------------------------------------------------
function ExternalAccountSettingsTab({
  form,
  mode,
  mailboxData,
}: ExternalAccountSettingsTabProps) {
  const t = useTranslations('US_MAIL_EXTERNAL_ACCOUNTS')
  const [showImapPassword, setShowImapPassword] = useState(false)
  const [showSmtpPassword, setShowSmtpPassword] = useState(false)
  const [smtpSameAsImap, setSmtpSameAsImap] = useState(false)
  const [collapsedIdentities, setCollapsedIdentities] = useState<
    Record<number, boolean>
  >({})

  const isEdit = mode === MODE_EDIT && !!mailboxData

  const {
    fields: identityFields,
    append: appendIdentity,
    remove: removeIdentity,
  } = useFieldArray({ control: form.control, name: 'identities' })

  // "Same as incoming" — keep SMTP password in sync with IMAP password
  const imapPassword = form.watch('mail_server.password')

  useEffect(() => {
    if (!smtpSameAsImap) return
    form.setValue('mail_outgoing.password', imapPassword, { shouldDirty: true })
  }, [smtpSameAsImap, imapPassword, form])

  const handleToggleSameAsImap = () => {
    const next = !smtpSameAsImap
    setSmtpSameAsImap(next)
    form.setValue(
      'mail_outgoing.password',
      next ? imapPassword : isEdit ? FAKE_PASSWORD_SENTINEL : '',
      { shouldDirty: true }
    )
  }

  // Ensure at least one identity is always default
  const identityValues = form.watch('identities')
  const hasDefault = identityValues?.some((id) => id.isDefault)

  useEffect(() => {
    if (!hasDefault && identityValues?.length > 0) {
      form.setValue('identities.0.isDefault', true, { shouldDirty: true })
    }
  }, [hasDefault, identityValues, form])

  // Remove identity — keep at least one; re-promote default if needed
  const handleRemoveIdentity = (i: number) => {
    if (identityFields.length <= 1) return
    const wasDefault = form.getValues(`identities.${i}.isDefault`)
    removeIdentity(i)
    if (wasDefault) {
      setTimeout(() => {
        form.setValue('identities.0.isDefault', true, { shouldDirty: true })
      }, 0)
    }
  }

  // Set default — uncheck all others, check the target
  const handleSetDefault = (i: number) => {
    identityFields.forEach((_, index) => {
      form.setValue(`identities.${index}.isDefault`, index === i, {
        shouldDirty: true,
      })
    })
  }

  return (
    <div className="space-y-8">
      {/* Mailbox name — create mode only */}
      {!isEdit && (
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('labels.name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder={t('placeholders.nameAccount')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* IMAP */}
      <SectionSeparator label={t('sections.imap.string')} />
      <ServerSection
        form={form}
        mode={mode}
        prefix={MAIL_SERVER}
        isEdit={isEdit}
        showPassword={showImapPassword}
        onTogglePassword={() => setShowImapPassword((v) => !v)}
      />

      {/* SMTP */}
      <SectionSeparator label={t('sections.smtp.string')} />
      <ServerSection
        form={form}
        mode={mode}
        prefix={MAIL_OUTGOING}
        isEdit={isEdit}
        showPassword={showSmtpPassword}
        onTogglePassword={() => setShowSmtpPassword((v) => !v)}
        sameAsIncoming={smtpSameAsImap}
        onToggleSameAsIncoming={handleToggleSameAsImap}
      />

      {/* Identities — single render loop for both create and edit */}
      <SectionSeparator label={t('sections.identity.string')} />
      <div className="space-y-4">
        {identityFields.map((identityField, i) => (
          <IdentityCard
            key={identityField.id}
            form={form}
            index={i}
            identityCount={identityFields.length}
            isCollapsed={!!collapsedIdentities[i]}
            onToggleCollapse={() =>
              setCollapsedIdentities((prev) => ({ ...prev, [i]: !prev[i] }))
            }
            onSetDefault={() => handleSetDefault(i)}
            onRemove={() => handleRemoveIdentity(i)}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => appendIdentity(emptyIdentity)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('labels.addIdentity')}
        </Button>
      </div>

      {/* Receipts */}
      <SectionSeparator
        label={t('sections.receipts.string')}
        description={t('sections.receipts.description')}
      />
      <ReceiptsEditor form={form} />
    </div>
  )
}

export default ExternalAccountSettingsTab

// ---------------------------------------------------------------------------
// Utility — strip unchanged sentinel passwords before submitting a PATCH
// ---------------------------------------------------------------------------

/**
 * Call this on your form values before sending them to the PATCH endpoint.
 * Any password field still holding the sentinel (user never touched it) is
 * omitted so the API doesn't overwrite the stored credential.
 *
 * Usage:
 *   const payload = stripUnchangedPasswords(form.getValues())
 *   await patchMailbox(mailboxId, payload)
 */
export function stripUnchangedPasswords(values: schemaType): schemaType {
  const out = structuredClone(values) as Record<string, unknown>

  for (const key of [MAIL_SERVER, MAIL_OUTGOING] as const) {
    const section = out[key] as Record<string, unknown> | undefined
    if (section?.['password'] === FAKE_PASSWORD_SENTINEL) {
      delete section['password']
    }
  }

  return out as schemaType
}
