import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserCalendarCategory,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import type React from 'react'
import { lazy } from 'react'

// Import types

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserCalendarCategory) => void
}

// Lazy load the address books form component
const LazyCalendarCategoriesFormCore = lazy(
  () => import('./calendar-categories-form-core')
)

const LazyCalendarCategoriesForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyCalendarCategoriesFormCore {...props} />
  </LazyWrapper>
)

export { LazyCalendarCategoriesForm as CalendarsCategoriesSettingsForm }
export default LazyCalendarCategoriesForm
