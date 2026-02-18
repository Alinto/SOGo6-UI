import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserCalendarGeneral,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import type React from 'react'
import { lazy } from 'react'

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserCalendarGeneral) => void
}

// Lazy load the address books form component
const LazyCalendarsGeneralFormCore = lazy(
  () => import('./calendar-general-form-core')
)

const LazyCalendarsGeneralForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyCalendarsGeneralFormCore {...props} />
  </LazyWrapper>
)

export { LazyCalendarsGeneralForm as CalendarsGeneralSettingsForm }
export default LazyCalendarsGeneralForm
