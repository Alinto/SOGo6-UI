'use client'

import React, { useCallback, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { getAuthUserId } from '@/features/offline/auth/get-auth-token'
import { redirectAfterLogout } from '@/features/offline/auth/redirect-after-logout'
import { countPendingOutbox } from '@/features/offline/db/outbox-store'
import { isPwaOutboxEnabled } from '@/features/offline/flags'
import { wipeOnLogout } from '@/features/offline/hooks/use-offline-draft-sync'
import { useOutboxList } from '@/features/offline/hooks/use-outbox'
import { useOfflineNav } from '@/features/offline/offline-nav-context'
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
  const tPwa = useTranslations('PWA')
  const isMobile = useIsMobile()
  const { theme } = useTheme()
  const dispatch = useAppDispatch()
  const { push } = useRouter()
  const { navigateApp } = useOfflineNav()
  const { user, isLoading, isError, preferences } = useProfile()
  const { pendingCount } = useOutboxList()
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false)

  // Fallback to auth.user if profile API failed
  const authUser = useAppSelector((state) => state.auth.user)
  const displayUser = isError ? authUser : user

  const userName = displayUser?.cn || t('account.defaultUser.string')
  const userEmail = displayUser?.email || ''

  // Get profile picture source from user preferences (defaults to PP_DEFAULT)
  const profilePictureSource =
    preferences?.USER_GENERAL?.SOGO_U_PROFILE_PICTURE || PP_DEFAULT

  const performLogout = useCallback(() => {
    void wipeOnLogout(authUser?.uid).finally(() => {
      dispatch(logout())
      redirectAfterLogout(push)
    })
  }, [authUser?.uid, dispatch, push])

  const handleLogoutClick = async () => {
    let count = pendingCount
    const userId = authUser?.uid ?? getAuthUserId()
    if (userId && isPwaOutboxEnabled()) {
      try {
        count = await countPendingOutbox(userId)
      } catch {
        count = pendingCount
      }
    }
    if (count > 0) {
      window.setTimeout(() => setConfirmLogoutOpen(true), 0)
      return
    }
    performLogout()
  }

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
    <>
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
              <div className="text-header-foreground text-sm">
                <div>{userName}</div>
                <div className="block text-sm">{userEmail}</div>
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="text-foreground">{t('theme.title.string')}</span>
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
            onClick={() => navigateApp('/user_settings/profile')}
          >
            <CircleUserRound className="pr-2" />
            {t('account.profile.string')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateApp('/user_settings/security')}
          >
            <UserRoundCog className="pr-2" />
            {t('account.security.string')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('settings.title.string')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateApp('/user_settings/general')}
          >
            <UserRoundCog className="pr-2" />
            {t('settings.general.string')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateApp('/user_settings/calendars/general')}
          >
            <CalendarCog className="pr-2" />
            {t('settings.calendar.string')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateApp('/user_settings/address_books')}
          >
            <BookA className="pr-2" /> {t('settings.address_books.string')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigateApp('/user_settings/mail/general')}
          >
            <Mail className="pr-2" /> {t('settings.email.string')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault()
              void handleLogoutClick()
            }}
          >
            <LogOut className="pr-2" />
            {t('logout.string')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirmLogoutOpen} onOpenChange={setConfirmLogoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tPwa('logout_outbox_confirm_title.string')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tPwa('logout_outbox_confirm_body.string')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmLogoutOpen(false)}>
              {tPwa('outbox_cancel.string')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={performLogout}>
              {tPwa('logout_outbox_confirm_action.string')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default HeaderDropdown
