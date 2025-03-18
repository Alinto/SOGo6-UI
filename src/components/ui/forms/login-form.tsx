import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

/* TRANSLATIONS_TODO */
export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const t = useTranslations('Login')
  return (
    <form className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">{t('email.label.string')}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('email.placeholder.string')}
            required
          />
        </div>
        <div className="grid gap-2 justify-end">
          <ArrowRight className="text-foreground" size={30} />
        </div>
      </div>
      <div className="text-center text-sm">
        {t('signup.description.string')}
        <a href="/register" className="underline underline-offset-4">
          {t('signup.title.string')}
        </a>
      </div>
    </form>
  )
}
