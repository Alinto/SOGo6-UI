'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import React, { memo } from 'react'

type RecipientAvatarProps = {
  email: string
  name?: string
  photo?: string
  size?: 'sm' | 'md'
}

const getRecipientInitials = (label: string) =>
  label
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

// Contact photo when known, otherwise the initials of the name (or email).
const RecipientAvatar: React.FC<RecipientAvatarProps> = ({
  email,
  name,
  photo,
  size = 'md',
}) => (
  <Avatar className={cn('shrink-0', size === 'sm' ? 'h-7 w-7' : 'h-10 w-10')}>
    {photo && (
      <AvatarImage src={photo} alt={name || email} className="object-cover" />
    )}
    <AvatarFallback
      className={cn('font-semibold', size === 'sm' ? 'text-xs' : 'text-sm')}
    >
      {getRecipientInitials(name || email)}
    </AvatarFallback>
  </Avatar>
)

export default memo(RecipientAvatar)
