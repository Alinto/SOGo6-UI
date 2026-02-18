'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import LabelsFormSkeleton from './general/components/skeleton'

import {
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesCalendarGeneralMutation,
} from '@/features/user-settings/store/user-preferences-api'

import { CalendarsGeneralSettingsForm } from './general/components/calendar-general-form'

const CalendarsGeneralSettings: React.FC = () => {
  const t = useTranslations('US_CALENDARS')
  const { data, error, isFetching } = useGetUserPreferencesQuery()
  const [updateCalendars] = useUpdateUserPreferencesCalendarGeneralMutation()
  if (error) {
    return 'ERROR' //TODO
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        <LabelsFormSkeleton />
      ) : (
        <CalendarsGeneralSettingsForm
          data={data?.data}
          update={updateCalendars}
        />
      )}
    </div>
  )
}

export default CalendarsGeneralSettings
