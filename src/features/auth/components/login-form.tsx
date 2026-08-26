'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useGetSystemQuery,
  useLazyGetAuthModeQuery,
} from '@/features/auth/components/store/auth.api'
import { useEnvVars } from '@/lib/env-service'
import { getLocales } from '@/lib/i18n/config'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { getErrorMessage } from '@/lib/redux/api/error-handlers'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Languages, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const localeLabels: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
}

// Languages available in the demo
const availableLocales = ['en']

const SYSTEM_LOAD_TIMEOUT_MS = 15_000

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z
      .string()
      .min(1, t('email.error.required.string'))
      .email(t('email.error.invalid.string')),
  })

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('AUTH')
  const { push } = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const locales = getLocales()
  const [isLoading, setIsLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [systemTimedOut, setSystemTimedOut] = React.useState(false)

  const {
    data: systemData,
    isLoading: systemLoading,
    isError: systemError,
    refetch: refetchSystem,
  } = useGetSystemQuery()
  const [getAuthMode] = useLazyGetAuthModeQuery()
  const { envVars } = useEnvVars()

  const loginSchema = React.useMemo(() => createLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  })

  React.useEffect(() => {
    const pre = envVars?.LOGIN_PREFILL_EMAIL?.trim()
    if (pre) {
      setValue('email', pre)
    }
  }, [envVars, setValue])

  React.useEffect(() => {
    if (!systemLoading) {
      setSystemTimedOut(false)
      return
    }

    const timer = window.setTimeout(() => {
      setSystemTimedOut(true)
    }, SYSTEM_LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timer)
  }, [systemLoading])

  // If SOGO_S_DIRECT_LOGIN → skip email step, go directly to password
  React.useEffect(() => {
    if (systemData?.data?.system?.SOGO_S_DIRECT_LOGIN) {
      push('/auth/login/pwd')
    }
  }, [systemData, push])

  const handleLocaleChange = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    push(newPathname)
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const result = await getAuthMode({ username: data.email }).unwrap()
      const { kind, location } = result.data

      switch (kind) {
        case 'plain':
          push(`/auth/login/pwd?email=${encodeURIComponent(data.email)}`)
          break
        case 'ldap':
          push(
            `/auth/login/pwd?email=${encodeURIComponent(data.email)}&mode=ldap`
          )
          break
        case 'sso':
          window.location.href = location
          break
        default:
          setServerError(t('error.unknown_provider.string'))
      }
    } catch (error) {
      setServerError(getErrorMessage(error) || t('error.generic.string'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetrySystem = () => {
    setSystemTimedOut(false)
    void refetchSystem()
  }

  const isOffline =
    typeof navigator !== 'undefined' && navigator.onLine === false
  const isSystemBlocked =
    !isOffline && systemLoading && !systemTimedOut && !systemError

  if (isSystemBlocked) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-primary-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (systemTimedOut || (systemError && !isOffline)) {
    return (
      <div className="mx-auto flex w-full max-w-xs flex-col gap-4 py-4">
        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t('error.system_timeout.string')}</p>
        </div>
        <Button type="button" variant="outline" onClick={handleRetrySystem}>
          {t('system_retry.string')}
        </Button>
      </div>
    )
  }

  return (
    <form
      className={cn('mx-auto flex w-full max-w-xs flex-col', className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      {serverError && (
        <div className="border-destructive/50 bg-destructive/10 text-destructive mb-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{serverError}</p>
        </div>
      )}
      {/* Email field group */}
      <div className="mb-6 grid gap-2">
        <Label
          htmlFor="email"
          className="text-primary-foreground text-sm leading-none font-medium"
        >
          {t('email.label.string')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={t('email.placeholder.string')}
          className={cn(
            'border-primary-foreground/60 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:ring-ring autofill:text-primary-foreground bg-transparent autofill:bg-transparent focus-visible:ring-2',
            errors.email && 'border-destructive focus-visible:ring-destructive'
          )}
          disabled={isLoading}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Language selector group */}
      <div className="mb-6 grid gap-2">
        <Label
          htmlFor="language"
          className="text-primary-foreground flex items-center gap-2 text-sm leading-none font-medium"
        >
          <Languages size={16} className="text-primary-foreground/70" />
          {t('language.label.string')}
        </Label>
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger
            id="language"
            className="border-primary-foreground/60 text-primary-foreground focus-visible:ring-ring bg-transparent focus-visible:ring-2"
            disabled={isLoading}
          >
            <SelectValue placeholder={localeLabels[locale] || locale} />
          </SelectTrigger>
          <SelectContent>
            {locales
              .filter((loc) => availableLocales.includes(loc))
              .map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {localeLabels[loc] || loc}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {/* Submit button - CTA principal */}
      <Button
        type="submit"
        size="lg"
        variant="outline"
        disabled={isLoading}
        className="bg-background border-primary-foreground/20 text-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/40 focus-visible:ring-ring w-full border-2 shadow-md transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {isLoading ? t('next.loading.string') : t('next.string')}
      </Button>
    </form>
  )
}
