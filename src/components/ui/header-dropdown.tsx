import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import React from 'react'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { ThemeSwitcher } from '../theme-switcher'

const HeaderDropdown: React.FC = () => {
  const t = useTranslations('Header')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
        <div
          data-testid="header-dropdown-trigger"
          className="flex items-center pl-4 gap-4 space-x-2"
        >
          <Avatar>
            <AvatarImage src="/images/account-avatar.svg" />
            <AvatarFallback>HF</AvatarFallback>
          </Avatar>
          <div className="text-background dark:text-foreground">
            <div>Henry Fafenback</div>
            <div className="block text-sm">sbarre@alinto.eu</div>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{t('theme.title.string')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('account.section.string')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <CircleUserRound className="pr-2" />
          {t('account.profile.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <UserRoundCog className="pr-2" />
          {t('account.security.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('settings.title.string')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <UserRoundCog className="pr-2" />
          {t('settings.general.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <CalendarCog className="pr-2" />
          {t('settings.agenda.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <BookA className="pr-2" /> {t('settings.address_books.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <Mail className="pr-2" /> {t('settings.email.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <Cog className="pr-2" />
          {t('admin.panel.string')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <LogOut className="pr-2" />
          {t('logout.string')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderDropdown
