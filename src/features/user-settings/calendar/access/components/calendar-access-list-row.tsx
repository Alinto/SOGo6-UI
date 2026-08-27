'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Calendar } from '@/features/calendars/calendars-types'
import ShareCalendarAction from '@/features/calendars/components/sidebar/actions/share'
import { useGetCalendarShareQuery } from '@/features/calendars/store/calendars-api'
import {
  ANY_AUTHENTICATED_UID,
  hasAnyCalendarRight,
} from '@/features/calendars/utils/calendar-permission-mapping'
import { Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

function getInitials(email?: string): string {
  if (email) {
    return email.slice(0, 2).toUpperCase()
  }
  return '?'
}

interface CalendarAccessListRowProps {
  calendar: Calendar
}

const CalendarAccessListRow: React.FC<CalendarAccessListRowProps> = ({
  calendar,
}) => {
  const t = useTranslations('US_CALENDARS_ACCESS')
  const [open, setOpen] = React.useState(false)
  const calendarKey = calendar.key ?? calendar.id ?? ''
  const { data, isLoading } = useGetCalendarShareQuery({ calendarKey })

  const allUsers = Object.values(data?.users ?? {})
  const grantedUsers = allUsers.filter((u) => u.uid !== ANY_AUTHENTICATED_UID)
  const anyAuthenticatedUser = allUsers.find(
    (u) => u.uid === ANY_AUTHENTICATED_UID
  )
  const hasAnyAuthenticated = Boolean(
    anyAuthenticatedUser && hasAnyCalendarRight(anyAuthenticatedUser.rights)
  )

  return (
    <div className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{calendar.name}</p>
        {isLoading ? (
          <Skeleton className="mt-1.5 h-3.5 w-32" />
        ) : (
          <div className="text-muted-foreground text-sm">
            {grantedUsers.length === 0 && !hasAnyAuthenticated ? (
              <p>{t('row.notShared.string')}</p>
            ) : (
              <>
                {grantedUsers.length > 0 && (
                  <p>
                    {grantedUsers.length === 1
                      ? t('row.sharedOne.string')
                      : t('row.sharedCount.string', {
                          count: grantedUsers.length,
                        })}
                  </p>
                )}
                {hasAnyAuthenticated && (
                  <p>{t('row.anyAuthenticated.string')}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {(grantedUsers.length > 0 || hasAnyAuthenticated) && (
        <div className="flex shrink-0 -space-x-2">
          {grantedUsers.slice(0, 3).map((u) => (
            <Avatar key={u.uid} className="border-background h-7 w-7 border-2">
              <AvatarFallback className="text-[10px]">
                {getInitials(u.c_email ?? u.uid)}
              </AvatarFallback>
            </Avatar>
          ))}
          {hasAnyAuthenticated && (
            <Avatar className="border-background h-7 w-7 border-2">
              <AvatarFallback>
                <Users className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        {t('row.manage.string')}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
          <ShareCalendarAction
            id={calendar.id ?? calendarKey}
            calendarKey={calendarKey}
            name={calendar.name}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CalendarAccessListRow
