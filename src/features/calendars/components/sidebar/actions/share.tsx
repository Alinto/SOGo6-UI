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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import ShareUserPicker, {
  type SharePickedUser,
} from '@/features/address_books/components/share-user-picker'
import {
  useGetCalendarShareQuery,
  useSetCalendarShareMutation,
} from '@/features/calendars/store/calendars-api'
import {
  ANY_AUTHENTICATED_UID,
  CALENDAR_CLASSIFICATIONS,
  CALENDAR_SHARE_LEVELS,
  defaultCalendarShareRights,
} from '@/features/calendars/utils/calendar-permission-mapping'
import { useProfile } from '@/features/user-profile'
import { Calendar, ChevronDown, Loader2, Trash2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import type {
  CalendarShareLevel,
  CalendarShareRights,
  CalendarShareUser,
} from '../../../calendars-types'

interface ShareCalendarActionProps {
  id: string
  calendarKey: string
  name: string
  onClose?: () => void
  /** Hides the "add user" input/button — used when only editing/removing existing grants is allowed. */
  allowAddUsers?: boolean
}

function getInitials(email?: string): string {
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}

const ShareCalendarAction: React.FC<ShareCalendarActionProps> = ({
  calendarKey,
  name,
  onClose,
  allowAddUsers = true,
}) => {
  const t = useTranslations('CALENDARS')
  const { mainAccount, folderSharingDisabledAnyAuth } = useProfile()
  const anyAuthenticatedSharingDisabled =
    folderSharingDisabledAnyAuth.includes('calendar')

  const [localUsers, setLocalUsers] = React.useState<CalendarShareUser[]>([])
  const [expandedUid, setExpandedUid] = React.useState<string | null>(null)

  const { data, isLoading } = useGetCalendarShareQuery({ calendarKey })
  const [setCalendarShare, { isLoading: isSaving }] =
    useSetCalendarShareMutation()

  React.useEffect(() => {
    if (data?.users) {
      const users: CalendarShareUser[] = Object.values(data.users).map((u) => ({
        uid: u.uid,
        c_email: u.c_email,
        userClass: u.userClass,
        rights: u.rights,
      }))

      const hasAnyAuthenticatedUser = users.some(
        (u) => u.uid === ANY_AUTHENTICATED_UID
      )

      if (!hasAnyAuthenticatedUser && !anyAuthenticatedSharingDisabled) {
        users.push({
          uid: ANY_AUTHENTICATED_UID,
          userClass: 'any-authenticated-user',
          rights: defaultCalendarShareRights(),
        })
      }

      setLocalUsers(users)
    }
  }, [data, anyAuthenticatedSharingDisabled])

  const currentUserEmail = mainAccount?.identities.find(
    (id) => id.isDefault
  )?.mail

  const isAlreadyShared = ({ uid, email }: SharePickedUser): boolean =>
    localUsers.some(
      (u) =>
        u.uid.toLowerCase() === uid.toLowerCase() ||
        u.c_email?.toLowerCase() === email.toLowerCase()
    )

  const handleAddUser = ({ uid, email }: SharePickedUser): void => {
    const newUser: CalendarShareUser = {
      uid,
      c_email: email,
      userClass: 'normal-user',
      rights: defaultCalendarShareRights(),
    }

    setLocalUsers((prev) => [...prev, newUser])
    setExpandedUid(uid)
  }

  const handleRemoveUser = (uid: string): void => {
    setLocalUsers((prev) => prev.filter((u) => u.uid !== uid))
    setExpandedUid((prev) => (prev === uid ? null : prev))
  }

  const handleRightsChange = (
    uid: string,
    patch: Partial<CalendarShareRights>
  ): void => {
    setLocalUsers((prev) =>
      prev.map((u) =>
        u.uid === uid ? { ...u, rights: { ...u.rights, ...patch } } : u
      )
    )
  }

  const handleSave = async (): Promise<void> => {
    try {
      await setCalendarShare({ calendarKey, users: localUsers }).unwrap()
      onClose?.()
    } catch {
      // Error handled by createApiNotificationHandler
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
          <Calendar className="h-4 w-4 shrink-0" />
          {t('sidebar.sharing.title.string')}{' '}
          <span className="text-muted-foreground font-normal">{name}</span>
        </DialogTitle>
        <DialogDescription>
          {t('sidebar.sharing.description.string', { calendar: name })}
        </DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <ScrollArea className="max-h-[420px] flex-1 pr-1">
          {isLoading ? (
            <div className="py-6 text-center">
              <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
            </div>
          ) : sortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Users className="text-muted-foreground h-10 w-10" />
              <p className="text-muted-foreground text-sm">
                {t('sidebar.sharing.noUsers.string')}
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
                          <span className="truncate text-sm leading-none font-medium">
                            {isAnyAuthenticated
                              ? t(
                                  'sidebar.sharing.anyAuthenticatedUser.label.string'
                                )
                              : (user.c_email ?? user.uid)}
                          </span>
                          {isCurrentUser && (
                            <Badge
                              variant="secondary"
                              className="shrink-0 text-xs"
                            >
                              {t('sidebar.sharing.badge.you.string')}
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
                          {CALENDAR_CLASSIFICATIONS.map((classification) => (
                            <div
                              key={classification.key}
                              className="flex items-center justify-between gap-2.5"
                            >
                              <span className="text-sm font-medium">
                                {t(classification.labelKey)}
                              </span>
                              <Select
                                value={user.rights[classification.key]}
                                disabled={isCurrentUser}
                                onValueChange={(value) =>
                                  handleRightsChange(user.uid, {
                                    [classification.key]:
                                      value as CalendarShareLevel,
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 w-[190px] shrink-0 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CALENDAR_SHARE_LEVELS.map((level) => (
                                    <SelectItem
                                      key={level.value}
                                      value={level.value}
                                      className="text-xs"
                                    >
                                      {t(level.labelKey)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>

                        <Separator />

                        <label className="flex items-center gap-2.5 text-sm">
                          <Checkbox
                            checked={user.rights.can_create_objects}
                            disabled={isCurrentUser}
                            onCheckedChange={(c) =>
                              handleRightsChange(user.uid, {
                                can_create_objects: c === true,
                              })
                            }
                          />
                          {t('sidebar.sharing.canCreate.label.string')}
                        </label>
                        <label className="flex items-center gap-2.5 text-sm">
                          <Checkbox
                            checked={user.rights.can_erase_objects}
                            disabled={isCurrentUser}
                            onCheckedChange={(c) =>
                              handleRightsChange(user.uid, {
                                can_erase_objects: c === true,
                              })
                            }
                          />
                          {t('sidebar.sharing.canErase.label.string')}
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        {allowAddUsers && (
          <>
            <Separator />

            <ShareUserPicker
              label={t('sidebar.sharing.addUser.label.string')}
              placeholder={t('sidebar.sharing.addUser.placeholder.string')}
              loadingLabel={t('sidebar.sharing.addUser.loading.string')}
              duplicateError={t(
                'sidebar.sharing.addUser.error.duplicate.string'
              )}
              isDuplicate={isAlreadyShared}
              onAdd={handleAddUser}
            />
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
          {t('sidebar.sharing.cancel.string')}
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            t('sidebar.sharing.save.string')
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export default memo(ShareCalendarAction)
