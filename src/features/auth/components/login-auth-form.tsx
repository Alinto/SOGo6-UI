import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/inputs/input-password'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import React from 'react'

export function LoginAuthForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('AUTH')
  const { push } = useRouter()
  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault()
        push('/u/0/INBOX')
      }}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="password">{t('password.label.string')}</Label>
          <PasswordInput
            id="password"
            value="password"
            placeholder={t('password.placeholder.string')}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          {t('login.string')}
        </Button>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <Label htmlFor="airplane-mode">{t('remember_me.string')}</Label>
        </div>
      </div>
    </form>
  )
}
