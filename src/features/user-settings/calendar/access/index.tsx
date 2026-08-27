'use client'

import { SettingsAsyncPage } from '@/features/user-settings/components/settings-async-page'
import { filterOwnedCalendars } from '@/features/user-settings/access/utils/owned-items'
import { useGetCalendarsQuery } from '@/features/calendars/store/calendars-api'
import { useProfile } from '@/features/user-profile'
import { CalendarDays } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'
import CalendarAccessListRow from './components/calendar-access-list-row'
import CalendarAccessSkeleton from './components/calendar-access-skeleton'

const CalendarsAccessSettings: React.FC = () => {
  const t = useTranslations('US_CALENDARS_ACCESS')
  const { folderSharingDisabled } = useProfile()

  const { data, error, isLoading } = useGetCalendarsQuery()
  const calendars = React.useMemo(
    () => filterOwnedCalendars(data ?? []),
    [data]
  )
  const isDisabled = folderSharingDisabled.includes('calendar')

  return (
    <SettingsAsyncPage
      title={t('title.string')}
      description={t('page.description.string')}
      error={error}
      isLoading={isLoading}
      featureDisabledMessage={t('errors_api.feature_disabled.string')}
      loadFailedMessage={t('errors_api.load_failed.string')}
      skeleton={<CalendarAccessSkeleton />}
    >
      {isDisabled ? (
        <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {t('disabled.string')}
        </div>
      ) : calendars.length === 0 ? (
        <div className="text-muted-foreground py-10 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-sm">{t('empty.string')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {calendars.map((calendar) => (
            <CalendarAccessListRow
              key={calendar.key ?? calendar.id}
              calendar={calendar}
            />
          ))}
        </div>
      )}
    </SettingsAsyncPage>
  )
}

export default CalendarsAccessSettings
