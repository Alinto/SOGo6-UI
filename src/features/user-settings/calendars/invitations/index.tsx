'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import CalendarInvitationsSettingsForm from './components/invitations-form'

import {
  useGetCalendarInvitationsSettingsQuery,
  useUpdateCalendarInvitationsSettingsMutation,
} from './store/calendar-invitations-settings-api'

const CalendarInvitationsSettings: React.FC = () => {
  const t = useTranslations('US_CALENDAR_INVITATIONS')
  const { data, error, isFetching } = useGetCalendarInvitationsSettingsQuery()
  const [updateData] = useUpdateCalendarInvitationsSettingsMutation()
  if (error) {
    return 'ERROR'
  }
  return (
    <div className="grid grid-cols-1 gap-4">
      <h2 className="text-2xl">{t('title.string')}</h2>
      {isFetching ? (
        'LOADING'
      ) : (
        <CalendarInvitationsSettingsForm data={data} update={updateData} />
      )}
    </div>
  )
}

export default CalendarInvitationsSettings
