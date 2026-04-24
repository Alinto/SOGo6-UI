import React from 'react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { logout } from '@/features/auth/components/store/auth.slice'
import { ProfileAvatar } from '@/features/user-profile/components/profile-avatar'
import { useProfile } from '@/features/user-profile/hooks/use-profile'
import { PP_DEFAULT } from '@/features/user-settings/store/user-preferences-api-types'
import { useIsMobile } from '@/hooks/use-mobile'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import {
  BookA,
  CalendarCog,
  CircleUserRound,
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
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { user, isLoading, isError, preferences } = useProfile()

  // Fallback to auth.user if profile API failed
  const authUser = useAppSelector((state) => state.auth.user)
  const displayUser = isError ? authUser : user

  const userName = displayUser?.cn || t('account.defaultUser.string')
  const userEmail = displayUser?.email || ''

  // Get profile picture source from user preferences (defaults to PP_DEFAULT)
  const profilePictureSource =
    preferences?.USER_GENERAL?.SOGO_U_PROFILE_PICTURE || PP_DEFAULT

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        {!isMobile && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        )}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:cursor-pointer" asChild>
        <div
          data-testid="header-dropdown-trigger"
          className="flex items-center gap-4 space-x-2 pl-4"
        >
          <ProfileAvatar
            pictureSource={profilePictureSource}
            email={userEmail}
            fallbackUsername={displayUser?.cn}
            useInitialsFallback={true}
            size="sm"
          />
          {!isMobile && (
            <div className="text-muted-foreground dark:text-foreground text-sm">
              <div>{userName}</div>
              <div className="block text-sm">{userEmail}</div>
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
          onClick={() => push('/user_settings/calendars/general')}
        >
          <CalendarCog className="pr-2" />
          {t('settings.calendar.string')}
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
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            dispatch(logout())
            push('/auth/login')
          }}
        >
          <LogOut className="pr-2" />
          {t('logout.string')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default HeaderDropdown
