'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  useGetAddressBookShareQuery,
  useSetAddressBookShareMutation,
  useSubscribeAddressBookUserMutation,
} from '@/features/address_books/store/address-books-api'
import {
  ADDRESS_BOOK_PERMISSIONS,
  ANY_AUTHENTICATED_UID,
  applyAddressBookPermissionToggle,
  defaultAddressBookShareRights,
  isAddressBookViewForced,
} from '@/features/address_books/utils/address-book-permission-mapping'
import { useProfile } from '@/features/user-profile'
import { AlertCircle, ChevronDown, Contact2, Loader2, Plus, Trash2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import type {
  AddressBookShareRights,
  AddressBookShareUser,
} from '../../../address-books-types'

interface ShareAddressBookActionProps {
  id: string
  name: string
  onClose?: () => void
  /** Hides the "add user" input/button — used when only editing/removing existing grants is allowed. */
  allowAddUsers?: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getInitials(email?: string): string {
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}

const ShareAddressBookAction: React.FC<ShareAddressBookActionProps> = ({
  id,
  name,
  onClose,
  allowAddUsers = true,
}) => {
  const t = useTranslations('ADDRESS_BOOKS_SIDEBAR')
  const { mainAccount, folderSharingDisabledAnyAuth } = useProfile()
  const anyAuthenticatedSharingDisabled =
    folderSharingDisabledAnyAuth.includes('contact')

  const [localUsers, setLocalUsers] = React.useState<AddressBookShareUser[]>(
    []
  )
  const [expandedUid, setExpandedUid] = React.useState<string | null>(null)
  const [newUserEmail, setNewUserEmail] = React.useState('')
  const [emailError, setEmailError] = React.useState<string | null>(null)
  const [subscribingUid, setSubscribingUid] = React.useState<string | null>(
    null
  )

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetAddressBookShareQuery({ bookId: id })
  const [setAddressBookShare, { isLoading: isSaving }] =
    useSetAddressBookShareMutation()
  const [subscribeUser] = useSubscribeAddressBookUserMutation()

  React.useEffect(() => {
    if (data?.users) {
      const users: AddressBookShareUser[] = Object.values(data.users).map(
        (u) => ({
          uid: u.uid,
          c_email: u.c_email,
          userClass: u.userClass,
          rights: u.rights,
          subscribed: u.subscribed ?? false,
        })
      )

      const hasAnyAuthenticatedUser = users.some(
        (u) => u.uid === ANY_AUTHENTICATED_UID
      )
      if (!hasAnyAuthenticatedUser && !anyAuthenticatedSharingDisabled) {
        users.push({
          uid: ANY_AUTHENTICATED_UID,
          userClass: 'any-authenticated-user',
          rights: defaultAddressBookShareRights(),
        })
      }

      setLocalUsers(users)
    }
  }, [data, anyAuthenticatedSharingDisabled])

  const currentUserEmail = mainAccount?.identities.find(
    (identity) => identity.isDefault
  )?.mail

  const handleAddUser = (): void => {
    const trimmed = newUserEmail.trim()

    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(t('sharing.addUser.error.invalid.string'))
      return
    }

    const alreadyExists = localUsers.some(
      (u) =>
        u.uid.toLowerCase() === trimmed.toLowerCase() ||
        u.c_email?.toLowerCase() === trimmed.toLowerCase()
    )
    if (alreadyExists) {
      setEmailError(t('sharing.addUser.error.duplicate.string'))
      return
    }

    const newUser: AddressBookShareUser = {
      uid: trimmed,
      c_email: trimmed,
      userClass: 'normal-user',
      rights: defaultAddressBookShareRights(),
      subscribed: false,
    }

    setLocalUsers((prev) => [...prev, newUser])
    setExpandedUid(trimmed)
    setNewUserEmail('')
    setEmailError(null)
  }

  const handleRemoveUser = (uid: string): void => {
    setLocalUsers((prev) => prev.filter((u) => u.uid !== uid))
    setExpandedUid((prev) => (prev === uid ? null : prev))
  }

  const handlePermissionToggle = (
    uid: string,
    key: keyof AddressBookShareRights,
    checked: boolean
  ): void => {
    setLocalUsers((prev) =>
      prev.map((u) =>
        u.uid === uid
          ? { ...u, rights: applyAddressBookPermissionToggle(u.rights, key, checked) }
          : u
      )
    )
  }

  const handleSubscribeUser = async (uid: string): Promise<void> => {
    setSubscribingUid(uid)
    try {
      await subscribeUser({ bookId: id, uid }).unwrap()
      setLocalUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, subscribed: true } : u))
      )
    } catch {
      // Error handled by createContactApiNotificationHandler
    } finally {
      setSubscribingUid(null)
    }
  }

  const handleSave = async (): Promise<void> => {
    try {
      await setAddressBookShare({ bookId: id, users: localUsers }).unwrap()
      onClose?.()
    } catch {
      // Error handled by createContactApiNotificationHandler
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUser()
    }
  }

  const sortedUsers = [...localUsers].sort(
    (a, b) =>
      (a.uid === ANY_AUTHENTICATED_UID ? 1 : 0) -
      (b.uid === ANY_AUTHENTICATED_UID ? 1 : 0)
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Contact2 className="h-4 w-4 shrink-0" />
          {t('sharing.title.string')}{' '}
          <span className="text-muted-foreground font-normal">{name}</span>
        </DialogTitle>
        <DialogDescription>
          {t('sharing.description.string', { addressBook: name })}
        </DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <ScrollArea className="max-h-[420px] flex-1 pr-1">
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <AlertCircle className="text-destructive h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                {t('sharing.loadError.string')}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
                {t('sharing.retry.string')}
              </Button>
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Users className="text-muted-foreground h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                {t('sharing.noUsers.string')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedUsers.map((user) => {
                const isCurrentUser =
                  currentUserEmail !== undefined &&
                  (user.uid === currentUserEmail ||
                    user.c_email === currentUserEmail)
                const isAnyAuthenticated = user.uid === ANY_AUTHENTICATED_UID
                const isExpanded = expandedUid === user.uid
                const viewForced = isAddressBookViewForced(user.rights)
                const isSubscribing = subscribingUid === user.uid

                return (
                  <div key={user.uid} className="border-b last:border-b-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 py-2.5 text-left"
                      onClick={() =>
                        setExpandedUid((prev) =>
                          prev === user.uid ? null : user.uid
                        )
                      }
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs">
                          {isAnyAuthenticated ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            getInitials(user.c_email ?? user.uid)
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium leading-none">
                            {isAnyAuthenticated
                              ? t('sharing.anyAuthenticatedUser.label.string')
                              : (user.c_email ?? user.uid)}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              {t('sharing.badge.you.string')}
                            </Badge>
                          )}
                          {!isAnyAuthenticated && user.subscribed && (
                            <Badge variant="outline" className="shrink-0 text-xs">
                              {t('sharing.subscribeUser.subscribed.string')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <ChevronDown
                        className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />

                      {!isAnyAuthenticated && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8 shrink-0"
                          disabled={isCurrentUser}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveUser(user.uid)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-3 pt-1 pb-3 pl-1">
                        <div className="space-y-2.5">
                          {ADDRESS_BOOK_PERMISSIONS.map((def) => {
                            const forced =
                              def.key === 'can_view' && viewForced
                            const checked = forced || user.rights[def.key]

                            return (
                              <label
                                key={def.key}
                                className="flex items-center gap-2.5 text-sm"
                              >
                                <Checkbox
                                  checked={checked}
                                  disabled={isCurrentUser || forced}
                                  onCheckedChange={(c) =>
                                    handlePermissionToggle(
                                      user.uid,
                                      def.key,
                                      c === true
                                    )
                                  }
                                />
                                {t(def.labelKey)}
                              </label>
                            )
                          })}
                        </div>

                        {!isAnyAuthenticated && (
                          <>
                            <Separator />
                            <div className="flex items-center justify-between gap-2.5">
                              <div className="flex flex-col gap-0.5">
                                <Label
                                  htmlFor={`subscribe-user-${user.uid}`}
                                  className="text-sm font-medium"
                                >
                                  {t('sharing.subscribeUser.button.string')}
                                </Label>
                                <span className="text-muted-foreground text-xs leading-snug">
                                  {t('sharing.subscribeUser.tooltip.string')}
                                </span>
                              </div>
                              {isSubscribing ? (
                                <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
                              ) : (
                                <Switch
                                  id={`subscribe-user-${user.uid}`}
                                  checked={user.subscribed ?? false}
                                  disabled={user.subscribed}
                                  onCheckedChange={(checked) => {
                                    if (checked) void handleSubscribeUser(user.uid)
                                  }}
                                />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {allowAddUsers && !isError && (
          <>
            <Separator />

            <div className="shrink-0 space-y-2">
              <p className="text-sm font-medium">
                {t('sharing.addUser.label.string')}
              </p>
              <div className="flex gap-2">
                <Input
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={t('sharing.addUser.placeholder.string')}
                  className="h-8 flex-1 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8 shrink-0"
                  onClick={handleAddUser}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">
                    {t('sharing.addUser.button.string')}
                  </span>
                </Button>
              </div>
              {emailError && (
                <p className="text-destructive text-xs">{emailError}</p>
              )}
            </div>
          </>
        )}
      </div>

      <DialogFooter className="mt-4 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
        >
          {t('sharing.cancel.string')}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading || isError}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('sharing.save.string')
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ShareAddressBookAction)
