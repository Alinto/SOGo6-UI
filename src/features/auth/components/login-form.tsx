'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from '@/lib/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('AUTH')
  const { push } = useRouter()
  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      {...props}
      onSubmit={async (e) => {
        e.preventDefault()
        const email = (e.target as HTMLFormElement).email.value
        push({ pathname: '/auth/login/pwd', query: { email } })
      }}
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">{t('email.label.string')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value="jdoe@sogo.nu"
            placeholder={t('email.placeholder.string')}
            required
          />
        </div>
        <div className="grid justify-end gap-2">
          <ArrowRight className="text-foreground" size={30} />
        </div>
      </div>
      {/* <div className="text-center text-sm">
        {t('signup.description.string')}
        <Link href="/register" className="underline underline-offset-4">
          {t('signup.title.string')}
        </Link>
      </div> */}
    </form>
  )
}
