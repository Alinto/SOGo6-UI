'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useProfile } from '@/features/user-profile'
import { ChevronDown, Loader2, Mail, Plus, Trash2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { FolderShareUser } from '../../mails-types'
import { useGetFolderShareQuery, useSetFolderShareMutation } from '../../store/mails-api'
import { ANY_AUTHENTICATED_UID } from '../../utils/permission-mapping'
import type { UserPermissionsChange } from './user-permissions-editor'
import { UserPermissionsEditor } from './user-permissions-editor'

interface ShareFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
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

export function ShareFolderDialog({
  open,
  onOpenChange,
  accountId,
  folderPath,
  folderName,
  allowAddUsers = true,
}: ShareFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { mainAccount, folderSharingDisabledAnyAuth } = useProfile()
  const anyAuthenticatedSharingDisabled =
    folderSharingDisabledAnyAuth.includes('mail')

  const [localUsers, setLocalUsers] = React.useState<FolderShareUser[]>([])
  const [expandedUid, setExpandedUid] = React.useState<string | null>(null)

  const [newUserEmail, setNewUserEmail] = React.useState('')
  const [emailError, setEmailError] = React.useState<string | null>(null)

  const { data, isLoading } = useGetFolderShareQuery(
    { accountId, folderPath },
    { skip: !open }
  )

  const [setFolderShare, { isLoading: isSaving }] = useSetFolderShareMutation()

  React.useEffect(() => {
    if (data?.users) {
      const users: FolderShareUser[] = Object.values(data.users).map((u) => ({
        uid: u.uid,
        c_email: u.c_email,
        userClass: u.userClass,
        rights: u.rights,
        permissions: u.permissions,
        applyToSubfolders: u.applyToSubfolders ?? false,
      }))

      const hasAnyAuthenticatedUser = users.some(
        (u) => u.uid === ANY_AUTHENTICATED_UID
      )
      if (!hasAnyAuthenticatedUser && !anyAuthenticatedSharingDisabled) {
        users.push({
          uid: ANY_AUTHENTICATED_UID,
          userClass: 'any-authenticated-user',
          rights: {},
          permissions: [],
          applyToSubfolders: false,
        })
      }

      setLocalUsers(users)
    }
  }, [data, anyAuthenticatedSharingDisabled])

  React.useEffect(() => {
    if (!open) {
      setExpandedUid(null)
      setNewUserEmail('')
      setEmailError(null)
    }
  }, [open])

  const currentUserEmail = mainAccount?.identities.find((id) => id.isDefault)?.mail

  const handleAddUser = (): void => {
    const trimmed = newUserEmail.trim()

    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError(t('folders.actions.sharing.addUser.error.invalid.string'))
      return
    }

    const alreadyExists = localUsers.some(
      (u) =>
        u.uid.toLowerCase() === trimmed.toLowerCase() ||
        u.c_email?.toLowerCase() === trimmed.toLowerCase()
    )
    if (alreadyExists) {
      setEmailError(t('folders.actions.sharing.addUser.error.duplicate.string'))
      return
    }

    const newUser: FolderShareUser = {
      uid: trimmed,
      c_email: trimmed,
      userClass: 'normal-user',
      rights: {},
      permissions: [],
      applyToSubfolders: false,
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

  const handlePermissionsChange = (
    uid: string,
    next: UserPermissionsChange
  ): void => {
    setLocalUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, ...next } : u))
    )
  }

  const handleApplyToSubfoldersChange = (
    uid: string,
    applyToSubfolders: boolean
  ): void => {
    setLocalUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, applyToSubfolders } : u))
    )
  }

  const handleSave = async (): Promise<void> => {
    try {
      await setFolderShare({
        accountId,
        folderPath,
        users: localUsers,
      }).unwrap()
      onOpenChange(false)
    } catch {
      // Error handled by createApiNotificationHandler
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddUser()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-125 max-h-[90vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0" />
            {t('folders.actions.sharing.title.string')}{' '}
            <span className="text-muted-foreground font-normal">
              {folderName}
            </span>
          </DialogTitle>
          <DialogDescription>
            {t('folders.actions.sharing.description.string', {
              folder: folderName,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          {/* User list */}
          <div className="min-h-50 flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : localUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Users className="text-muted-foreground h-10 w-10" />
                <p className="text-muted-foreground text-sm">
                  {t('folders.actions.sharing.noUsers.string')}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {[...localUsers]
                  .sort((a, b) =>
                    (a.uid === ANY_AUTHENTICATED_UID ? 1 : 0) -
                    (b.uid === ANY_AUTHENTICATED_UID ? 1 : 0)
                  )
                  .map((user) => {
                  const isCurrentUser =
                    currentUserEmail !== undefined &&
                    (user.uid === currentUserEmail ||
                      user.c_email === currentUserEmail)
                  const isPublic = user.userClass === 'public-user'
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
                            <span className="truncate text-sm font-medium leading-none">
                              {isAnyAuthenticated
                                ? t(
                                    'folders.actions.sharing.anyAuthenticatedUser.label.string'
                                  )
                                : (user.c_email ?? user.uid)}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="shrink-0 text-xs">
                                {t('folders.actions.sharing.badge.you.string')}
                              </Badge>
                            )}
                            {isPublic && (
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {t('folders.actions.sharing.badge.public.string')}
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
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>
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
                                </span>
                              </TooltipTrigger>
                              {isCurrentUser && (
                                <TooltipContent>
                                  {t('folders.actions.sharing.removeUser.tooltip.string')}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="max-h-150 overflow-y-auto pr-3">
                          <UserPermissionsEditor
                            rights={user.rights}
                            onChange={(next) =>
                              handlePermissionsChange(user.uid, next)
                            }
                            applyToSubfolders={user.applyToSubfolders ?? false}
                            onApplyToSubfoldersChange={(checked) =>
                              handleApplyToSubfoldersChange(user.uid, checked)
                            }
                            disabled={isCurrentUser}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {allowAddUsers && (
            <>
              <Separator />

              {/* Add user section */}
              <div className="shrink-0 space-y-2">
                <p className="text-sm font-medium">
                  {t('folders.actions.sharing.addUser.label.string')}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={newUserEmail}
                    onChange={(e) => {
                      setNewUserEmail(e.target.value)
                      if (emailError) setEmailError(null)
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={t(
                      'folders.actions.sharing.addUser.placeholder.string'
                    )}
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
                      {t('folders.actions.sharing.addUser.button.string')}
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
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('folders.actions.sharing.cancel.string')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('folders.actions.sharing.save.string')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
