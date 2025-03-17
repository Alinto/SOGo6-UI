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
        <DropdownMenuLabel>{t('theme.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ThemeSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('account.section')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <CircleUserRound className="pr-2" />
          {t('account.profile')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <UserRoundCog className="pr-2" />
          {t('account.security')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('settings.title')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <UserRoundCog className="pr-2" />
          {t('settings.general')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <CalendarCog className="pr-2" />
          {t('settings.agenda')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <BookA className="pr-2" /> {t('settings.address_books')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <Mail className="pr-2" /> {t('settings.email')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem>
          <Cog className="pr-2" />
          {t('admin.panel')}
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem>
          <LogOut className="pr-2" />
          {t('logout')}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderDropdown
