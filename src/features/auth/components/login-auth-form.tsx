'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInput } from '@/components/ui/inputs/input-password'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const createPasswordSchema = (t: (key: string) => string) =>
  z.object({
    password: z
      .string()
      .min(8, t('password.error.min.string'))
      .max(128, t('password.error.max.string')),
    rememberMe: z.boolean(),
  })

type PasswordFormData = z.infer<ReturnType<typeof createPasswordSchema>>

export function LoginAuthForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('AUTH')
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [isLoading, setIsLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const passwordSchema = React.useMemo(() => createPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: 'demo1234',
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

  // Redirect if no email
  React.useEffect(() => {
    if (!email) {
      push('/auth/login')
    }
  }, [email, push])

  const onSubmit = async (data: PasswordFormData) => {
    if (!email) return

    setIsLoading(true)
    setServerError(null)

    try {
      // Local simulation (no API call)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate basic validation
      if (data.password.length < 8) {
        throw new Error(t('error.invalid_credentials.string'))
      }

      // Simulate failure for certain passwords (example)
      if (data.password === 'wrongpassword') {
        throw new Error(t('error.invalid_credentials.string'))
      }

      // Simulate successful authentication
      // Redirect to inbox
      push('/u/0/INBOX')
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : t('error.generic.string')
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null // Or a loader during redirect
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

      {/* Email display (read-only) */}
      <div className="mb-6 grid gap-2">
        <Label className="text-primary-foreground text-sm">
          {t('email.label.string')}
        </Label>
        <p className="text-primary-foreground text-sm font-medium">{email}</p>
      </div>

      {/* Password field */}
      <div className="mb-6 grid gap-2">
        <Label htmlFor="password" className="text-primary-foreground">
          {t('password.label.string')}
        </Label>
        <PasswordInput
          id="password"
          placeholder={t('password.placeholder.string')}
          className={cn(
            'border-primary-foreground/60 text-primary-foreground placeholder:text-primary-foreground/70 focus-visible:ring-ring autofill:text-primary-foreground bg-transparent autofill:bg-transparent focus-visible:ring-2',
            errors.password &&
              'border-destructive focus-visible:ring-destructive'
          )}
          disabled={isLoading}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          autoComplete="current-password"
          autoFocus
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember me */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 min-h-[44px] items-center">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) =>
              setValue('rememberMe', checked === true)
            }
            disabled={isLoading}
            className="border-primary-foreground/60 data-[state=checked]:border-primary-foreground data-[state=checked]:bg-primary-foreground/20 focus-visible:ring-ring focus-visible:ring-2"
          />
        </div>
        <Label
          htmlFor="remember-me"
          className="text-primary-foreground cursor-pointer text-sm leading-none font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {t('remember_me.string')}
        </Label>
      </div>
      {/* Submit button */}
      <div className="mb-6">
        <Button
          type="submit"
          size="lg"
          variant="outline"
          disabled={isLoading}
          className="bg-background border-primary-foreground/20 text-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/40 focus-visible:ring-ring w-full border-2 shadow-md transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          {isLoading ? t('login.loading.string') : t('login.string')}
        </Button>
      </div>
    </form>
  )
}
