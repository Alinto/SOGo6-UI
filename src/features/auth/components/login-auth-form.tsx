'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInput } from '@/components/ui/inputs/input-password'
import { Label } from '@/components/ui/label'
import { useLoginMutation } from '@/features/auth/components/store/auth.api'
import { setCredentials } from '@/features/auth/components/store/auth.slice'
import { useLazyGetUserPreferencesQuery } from '@/features/user-settings/store/user-preferences-api'
import { useRouter } from '@/lib/i18n/navigation'
import { getErrorMessage, getErrorStatus } from '@/lib/redux/api/error-handlers'
import { useAppDispatch } from '@/lib/redux/hooks'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface JwtPayload {
  uid: string
  cn: string
  email: string
}

function decodeJwtPayload(token: string): JwtPayload {
  const [, payloadB64] = token.split('.')
  // Convertir base64url → base64 standard
  const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as JwtPayload
}

const createPasswordSchema = (t: (key: string) => string) =>
  z.object({
    password: z
      .string()
      .min(1, t('password.error.min.string'))
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
  const mode = searchParams.get('mode') // 'ldap' ou null

  const dispatch = useAppDispatch()
  const [login] = useLoginMutation()

  const [isLoading, setIsLoading] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const passwordSchema = React.useMemo(() => createPasswordSchema(t), [t])

  const [getUserPreferences] = useLazyGetUserPreferencesQuery()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      rememberMe: false,
    },
  })

  const rememberMe = watch('rememberMe')

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
      const result = await login({
        username: email,
        password: data.password,
      }).unwrap()

      if (!result.data?.jwt_token) {
        throw new Error(t('error.invalid_credentials.string'))
      }

      const payload = decodeJwtPayload(result.data.jwt_token)

      dispatch(
        setCredentials({
          token: result.data.jwt_token,
          user: {
            uid: payload.uid,
            cn: payload.cn,
            email: payload.email,
          },
          rememberMe: data.rememberMe,
        })
      )

      push('/u/0/INBOX')
    } catch (error: unknown) {
      const status = getErrorStatus(error)

      if (status === 401) {
        setServerError(t('error.invalid_credentials.string'))
      } else if (status === 404) {
        setServerError(t('error.route_not_found.string'))
      } else {
        setServerError(getErrorMessage(error) || t('error.generic.string'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
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

      <div className="mb-6 grid gap-2">
        <Label className="text-primary-foreground text-sm">
          {t('email.label.string')}
        </Label>
        <p className="text-primary-foreground text-sm font-medium">{email}</p>
        {mode === 'ldap' && (
          <p className="text-primary-foreground/60 text-xs">
            {t('auth_mode.ldap.string')}
          </p>
        )}
      </div>

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
