import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from '@/lib/i18n/navigation'
import {
  BookA,
  CalendarCog,
  CircleUserRound,
  Cog,
  LogOut,
  Mail,
  UserRoundCog,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { ThemeSwitcher } from '../theme-switcher'

const HeaderDropdown: React.FC = () => {
  const t = useTranslations('HEADER')
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const { push } = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
        <div
          data-testid="header-dropdown-trigger"
          className="flex items-center gap-4 space-x-2 pl-4"
        >
          <Avatar>
            <AvatarImage src="/images/account-avatar.svg" />
            <AvatarFallback>HF</AvatarFallback>
          </Avatar>
          {!isMobile && (
            <div className="text-sidebar-accent-foreground dark:text-foreground text-sm">
              <div>Henry Fafenback</div>
              <div className="block text-sm">sbarre@alinto.eu</div>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-foreground dark:text-foreground">
            {t('theme.title.string')}
          </span>
          <span className="text-muted-foreground text-right">
            {t(`theme.${theme}.string`)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('account.section.string')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/profile')}
        >
          <CircleUserRound className="pr-2" />
          {t('account.profile.string')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/security')}
        >
          <UserRoundCog className="pr-2" />
          {t('account.security.string')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('settings.title.string')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/general')}
        >
          <UserRoundCog className="pr-2" />
          {t('settings.general.string')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/calendar/general')}
        >
          <CalendarCog className="pr-2" />
          {t('settings.agenda.string')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/address_books')}
        >
          <BookA className="pr-2" /> {t('settings.address_books.string')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/user_settings/mail/general')}
        >
          <Mail className="pr-2" /> {t('settings.email.string')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/admin/panel')}
        >
          <Cog className="pr-2" />
          {t('admin.panel.string')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => push('/logout')}
        >
          <LogOut className="pr-2" />
          {t('logout.string')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderDropdown
