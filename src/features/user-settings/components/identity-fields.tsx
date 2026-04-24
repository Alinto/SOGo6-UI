import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

export const emptyIdentity = {
  name: '',
  mail: '',
  replyTo: '',
  isDefault: false,
  signatures: {},
}

interface IdentityFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>
  index: number
  identityCount: number
  onSetDefault: () => void
  translationNamespace?: string
  disableFields?: {
    name?: boolean
    mail?: boolean
    replyTo?: boolean
    isDefault?: boolean
  }
  fieldLabels?: {
    name?: string
    email?: string
    replyTo?: string
    isDefault?: string
    isDefaultDescription?: string
  }
  fieldDescriptions?: {
    name?: string
    email?: string
    replyTo?: string
  }
  readOnlyFields?: {
    mail?: boolean
  }
}

export function IdentityFields<T extends FieldValues>({
  form,
  index,
  identityCount,
  onSetDefault,
  translationNamespace = 'US_MAIL_EXTERNAL_ACCOUNTS',
  disableFields = {},
  fieldLabels = {},
  fieldDescriptions = {},
  readOnlyFields = {},
}: IdentityFieldsProps<T>) {
  const t = useTranslations(translationNamespace)

  // Helper to get label with fallback to translation
  const getLabel = (key: string, customLabel?: string) => {
    if (customLabel) return customLabel
    return t(`labels.${key}`)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 md:space-x-10">
        <FormField
          control={form.control}
          name={`identities.${index}.name` as Path<T>}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{getLabel('name', fieldLabels.name)}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="John Doe"
                  disabled={disableFields?.name}
                />
              </FormControl>
              {fieldDescriptions?.name && (
                <FormDescription className="text-xs">
                  {fieldDescriptions.name}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`identities.${index}.mail` as Path<T>}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{getLabel('email', fieldLabels.email)}</FormLabel>
              <FormControl>
                {readOnlyFields?.mail ? (
                  <div className="border-input bg-muted flex items-center rounded-md border px-3 py-2">
                    <span className="text-sm">{field.value}</span>
                  </div>
                ) : (
                  <Input
                    {...field}
                    type="email"
                    placeholder="user@example.com"
                    disabled={disableFields?.mail}
                  />
                )}
              </FormControl>
              {fieldDescriptions?.email && (
                <FormDescription className="text-xs">
                  {fieldDescriptions.email}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`identities.${index}.replyTo` as Path<T>}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{getLabel('replyTo', fieldLabels.replyTo)}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="noreply@example.com"
                  disabled={disableFields?.replyTo}
                />
              </FormControl>
              {fieldDescriptions?.replyTo && (
                <FormDescription className="text-xs">
                  {fieldDescriptions.replyTo}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* isDefault — only shown when there are multiple identities */}
      {identityCount > 1 && !disableFields?.isDefault && (
        <FormField
          control={form.control}
          name={`identities.${index}.isDefault` as Path<T>}
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
                  {fieldLabels?.isDefault ||
                    t('labels.useDefaultIdentity.string')}
                </Label>
                <FormDescription className="text-muted-foreground">
                  {fieldLabels?.isDefaultDescription ||
                    t('description.useDefaultIdentity.string')}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}
    </>
  )
}
