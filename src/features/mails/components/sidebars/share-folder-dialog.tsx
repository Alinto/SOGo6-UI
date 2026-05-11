'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useProfile } from '@/features/user-profile'
import { Loader2, Plus, Trash2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { FolderShareUser, ShareRightPreset } from '../../mails-types'
import { useGetFolderShareQuery, useSetFolderShareMutation } from '../../store/mails-api'
import { detectPreset, SHARE_PRESETS } from '../../utils/share-presets'

interface ShareFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
  folderPath: string
  folderName: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PRESET_OPTIONS: ShareRightPreset[] = ['read', 'write', 'admin']

type PresetLabelKey =
  | 'folders.actions.sharing.presets.read.string'
  | 'folders.actions.sharing.presets.write.string'
  | 'folders.actions.sharing.presets.admin.string'

const PRESET_LABEL_KEYS: Record<ShareRightPreset, PresetLabelKey> = {
  read: 'folders.actions.sharing.presets.read.string',
  write: 'folders.actions.sharing.presets.write.string',
  admin: 'folders.actions.sharing.presets.admin.string',
  none: 'folders.actions.sharing.presets.read.string',
}

function getInitials(cn?: string, email?: string): string {
  if (cn) {
    const parts = cn.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return cn.slice(0, 2).toUpperCase()
  }
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
}: ShareFolderDialogProps) {
  const t = useTranslations('MAILS_COMMONS')
  const { mainAccount } = useProfile()

  const [localUsers, setLocalUsers] = React.useState<FolderShareUser[]>([])
  const [newUserEmail, setNewUserEmail] = React.useState('')
  const [newUserPreset, setNewUserPreset] = React.useState<ShareRightPreset>('read')
  const [emailError, setEmailError] = React.useState<string | null>(null)

  const { data, isLoading } = useGetFolderShareQuery(
    { accountId, folderPath },
    { skip: !open }
  )

  const [setFolderShare, { isLoading: isSaving }] = useSetFolderShareMutation()

  React.useEffect(() => {
    if (data?.users) {
      const users = Object.values(data.users).map((u) => ({
        uid: u.uid,
        c_email: u.c_email,
        cn: u.cn,
        userClass: u.userClass,
        rights: u.rights,
      }))
      setLocalUsers(users)
    }
  }, [data])

  React.useEffect(() => {
    if (!open) {
      setNewUserEmail('')
      setNewUserPreset('read')
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
      (u) => u.uid === trimmed || u.c_email === trimmed
    )
    if (alreadyExists) {
      setEmailError(t('folders.actions.sharing.addUser.error.duplicate.string'))
      return
    }

    const newUser: FolderShareUser = {
      uid: trimmed,
      c_email: trimmed,
      userClass: 'normal-user',
      rights: SHARE_PRESETS[newUserPreset],
    }

    setLocalUsers((prev) => [...prev, newUser])
    setNewUserEmail('')
    setNewUserPreset('read')
    setEmailError(null)
  }

  const handleRemoveUser = (uid: string): void => {
    setLocalUsers((prev) => prev.filter((u) => u.uid !== uid))
  }

  const handlePresetChange = (uid: string, preset: ShareRightPreset): void => {
    setLocalUsers((prev) =>
      prev.map((u) =>
        u.uid === uid ? { ...u, rights: SHARE_PRESETS[preset] } : u
      )
    )
  }

  const handleSave = async (): Promise<void> => {
    try {
      await setFolderShare({ accountId, folderPath, users: localUsers }).unwrap()
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-[480px]"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle>
            {t('folders.actions.sharing.title.string')}{' '}
            <span className="text-muted-foreground font-normal">
              {folderName}
            </span>
          </SheetTitle>
          <SheetDescription>
            {t('folders.actions.sharing.description.string', {
              folder: folderName,
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          {/* User list */}
          <ScrollArea className="max-h-[340px] flex-1 pr-1">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-8 w-[110px]" />
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
              <div className="space-y-3">
                {localUsers.map((user) => {
                  const isCurrentUser =
                    currentUserEmail !== undefined &&
                    (user.uid === currentUserEmail ||
                      user.c_email === currentUserEmail)
                  const isPublic = user.userClass === 'public-user'
                  const preset = detectPreset(user.rights)
                  const displayPreset: ShareRightPreset = preset === 'none' ? 'read' : preset

                  return (
                    <div
                      key={user.uid}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs">
                          {getInitials(user.cn, user.c_email ?? user.uid)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-medium leading-none">
                            {user.cn ?? user.uid}
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
                        {user.c_email && user.cn && (
                          <p className="text-muted-foreground mt-0.5 truncate text-xs">
                            {user.c_email}
                          </p>
                        )}
                      </div>

                      <Select
                        value={displayPreset}
                        onValueChange={(value) =>
                          handlePresetChange(user.uid, value as ShareRightPreset)
                        }
                        disabled={isCurrentUser}
                      >
                        <SelectTrigger className="h-8 w-[110px] shrink-0 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESET_OPTIONS.map((p) => (
                            <SelectItem key={p} value={p} className="text-xs">
                              {t(PRESET_LABEL_KEYS[p])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                                disabled={isCurrentUser}
                                onClick={() => handleRemoveUser(user.uid)}
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
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

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
                placeholder={t('folders.actions.sharing.addUser.placeholder.string')}
                className="h-8 flex-1 text-sm"
              />
              <Select
                value={newUserPreset}
                onValueChange={(value) => setNewUserPreset(value as ShareRightPreset)}
              >
                <SelectTrigger className="h-8 w-[110px] shrink-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p} className="text-xs">
                      {t(PRESET_LABEL_KEYS[p])}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <SheetFooter className="mt-4 shrink-0">
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
