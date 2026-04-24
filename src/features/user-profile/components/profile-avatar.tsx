'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { memo } from 'react'
import {
  PP_DEFAULT,
  PP_GRAVATAR,
  PP_LIBRAVATAR,
  PP_USERSOURCE,
} from '../../user-settings/store/user-preferences-api-types'
import { useAvatarSource } from '../hooks/use-avatar-source'

interface ProfileAvatarProps {
  pictureSource:
    | typeof PP_DEFAULT
    | typeof PP_GRAVATAR
    | typeof PP_LIBRAVATAR
    | typeof PP_USERSOURCE
  email?: string
  userSourceBase64?: string
  fallbackUsername?: string
  useInitialsFallback?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'h-10 w-10',
  md: 'h-20 w-20',
  lg: 'h-32 w-32',
}

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-3xl',
  lg: 'text-3xl',
}

/**
 * Shared component for displaying user profile avatars
 * Handles gravatar, libravatar, custom uploads, and fallback
 */
export const ProfileAvatar = memo(function ProfileAvatar({
  pictureSource,
  email,
  userSourceBase64,
  fallbackUsername = 'U',
  useInitialsFallback = false,
  size = 'md',
  className,
}: ProfileAvatarProps) {
  const avatarSource = useAvatarSource({
    pictureSource,
    email,
    userSourceBase64,
  })

  const sizeClass = sizeMap[size]
  const textSizeClass = textSizeMap[size]

  const getFallbackInitials = () => {
    const initials =
      fallbackUsername
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U'
    return initials
  }

  return (
    <Avatar className={`${sizeClass} ${className || ''}`}>
      {avatarSource.type === 'image' && avatarSource.src && (
        <AvatarImage src={avatarSource.src} alt={avatarSource.alt} />
      )}
      {avatarSource.type === 'fallback' && (
        <AvatarImage src="/images/account-avatar.svg" />
      )}
      <AvatarFallback className={`text-header-foreground ${textSizeClass}`}>
        {useInitialsFallback ? getFallbackInitials() : fallbackUsername}
      </AvatarFallback>
    </Avatar>
  )
})

ProfileAvatar.displayName = 'ProfileAvatar'
