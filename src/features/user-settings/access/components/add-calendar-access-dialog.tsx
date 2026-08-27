'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
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
import {
  useGetCalendarsQuery,
  useLazyGetCalendarShareQuery,
  useSetCalendarShareMutation,
} from '@/features/calendars/store/calendars-api'
import type { CalendarShareLevel, CalendarShareUser } from '@/features/calendars/calendars-types'
import {
  CALENDAR_CLASSIFICATIONS,
  CALENDAR_SHARE_LEVELS,
  defaultCalendarShareRights,
} from '@/features/calendars/utils/calendar-permission-mapping'
import { filterOwnedCalendars } from '@/features/user-settings/access/utils/owned-items'
import { Calendar, Loader2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import type { GlobalAccessUserEntry } from '../store/access-api'

interface AddCalendarAccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: GlobalAccessUserEntry
}

const AddCalendarAccessDialog: React.FC<AddCalendarAccessDialogProps> = ({
  open,
  onOpenChange,
  entry,
}) => {
  const t = useTranslations('US_ACCESS')
  const calendarT = useTranslations('CALENDARS')

  const { data: calendars, isLoading } = useGetCalendarsQuery(undefined, {
    skip: !open,
  })
  const [setCalendarShare] = useSetCalendarShareMutation()
  const [fetchCalendarShare] = useLazyGetCalendarShareQuery()

  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set())
  const [rights, setRights] = React.useState(defaultCalendarShareRights())
  const [isSaving, setIsSaving] = React.useState(false)

  const sharedKeys = React.useMemo(
    () =>
      new Set(
        entry.grants
          .filter((grant) => grant.domain === 'calendar')
          .map((grant) => grant.itemKey)
      ),
    [entry.grants]
  )

  const allCalendars = React.useMemo(
    () => filterOwnedCalendars(calendars ?? []),
    [calendars]
  )
  const available = React.useMemo(
    () =>
      allCalendars.filter(
        (calendar) => !sharedKeys.has(calendar.key ?? calendar.id ?? '')
      ),
    [allCalendars, sharedKeys]
  )

  React.useEffect(() => {
    if (!open) {
      setSelectedKeys(new Set())
      setRights(defaultCalendarShareRights())
      setIsSaving(false)
    }
  }, [open])

  const toggleCalendar = (key: string): void => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSave = async (): Promise<void> => {
    if (selectedKeys.size === 0) return

    setIsSaving(true)
    try {
      const newUser: CalendarShareUser = {
        uid: entry.uid,
        c_email: entry.c_email,
        userClass: 'normal-user',
        rights,
      }

      await Promise.all(
        Array.from(selectedKeys).map(async (calendarKey) => {
          const shareData = await fetchCalendarShare({ calendarKey }).unwrap()
          const existing = Object.values(shareData.users).filter(
            (u) => u.uid !== entry.uid
          )
          await setCalendarShare({
            calendarKey,
            users: [...existing, newUser],
          }).unwrap()
        })
      )
      onOpenChange(false)
    } catch {
      // Error surfaced by each mutation's own notification handler.
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex min-h-125 max-h-[90vh] max-w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4 shrink-0" />
            {t('addAccess.calendar.title.string')}
          </DialogTitle>
          <DialogDescription>
            {t('addAccess.calendar.description.string', {
              user: entry.c_email ?? entry.uid,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4">
          <div className="shrink-0 space-y-2">
            <p className="text-sm font-medium">{t('addAccess.itemsLabel.string')}</p>
            <ScrollArea className="h-40 rounded-md border p-2">
              {isLoading ? (
                <div className="py-4 text-center">
                  <Loader2 className="text-muted-foreground mx-auto h-5 w-5 animate-spin" />
                </div>
              ) : available.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <Users className="text-muted-foreground h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    {t(
                      allCalendars.length === 0
                        ? 'addAccess.noItems.string'
                        : 'addAccess.allShared.string'
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {available.map((calendar) => {
                    const key = calendar.key ?? calendar.id ?? ''
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2.5 rounded px-1 py-1.5 text-sm"
                      >
                        <Checkbox
                          checked={selectedKeys.has(key)}
                          onCheckedChange={() => toggleCalendar(key)}
                        />
                        <span className="truncate">{calendar.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <div className="space-y-2.5">
              {CALENDAR_CLASSIFICATIONS.map((classification) => (
                <div
                  key={classification.key}
                  className="flex items-center justify-between gap-2.5"
                >
                  <span className="text-sm font-medium">
                    {calendarT(classification.labelKey)}
                  </span>
                  <Select
                    value={rights[classification.key]}
                    onValueChange={(value) =>
                      setRights((prev) => ({
                        ...prev,
                        [classification.key]: value as CalendarShareLevel,
                      }))
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
                          {calendarT(level.labelKey)}
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
                checked={rights.can_create_objects}
                onCheckedChange={(c) =>
                  setRights((prev) => ({ ...prev, can_create_objects: c === true }))
                }
              />
              {calendarT('sidebar.sharing.canCreate.label.string')}
            </label>
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox
                checked={rights.can_erase_objects}
                onCheckedChange={(c) =>
                  setRights((prev) => ({ ...prev, can_erase_objects: c === true }))
                }
              />
              {calendarT('sidebar.sharing.canErase.label.string')}
            </label>
          </div>
        </div>

        <DialogFooter className="mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('addAccess.cancel.string')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || selectedKeys.size === 0}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('addAccess.confirm.string')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AddCalendarAccessDialog
