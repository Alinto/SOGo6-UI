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
import { getLocales } from '@/lib/i18n/config'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Languages } from 'lucide-react'
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

  const loginSchema = React.useMemo(() => createLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@sogo.com',
    },
  })

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale in the pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`)
    push(newPathname)
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setServerError(null)

    try {
      // Simulation
      await new Promise((resolve) => setTimeout(resolve, 500))

      const provider = 'local'

      if (provider === 'local') {
        push(`/auth/login/pwd?email=${encodeURIComponent(data.email)}`)
      } else {
        console.log('Redirection SSO (à implémenter)', provider)
      }
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t('error.generic.string')
      )
    } finally {
      setIsLoading(false)
    }
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
          className="text-foreground text-sm leading-none font-medium"
        >
          {t('email.label.string')}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={t('email.placeholder.string')}
          className={cn(
            'border-primary-foreground/60 focus-visible:ring-ring focus-visible:ring-2',
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
          className="text-foreground flex items-center gap-2 text-sm leading-none font-medium"
        >
          <Languages size={16} className="text-muted-foreground" />
          {t('language.label.string')}
        </Label>
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger
            id="language"
            className="border-primary-foreground/60 focus-visible:ring-ring focus-visible:ring-2"
            disabled={isLoading}
          >
            <SelectValue placeholder={localeLabels[locale] || locale} />
          </SelectTrigger>
          <SelectContent>
            {locales.map((loc) => (
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
