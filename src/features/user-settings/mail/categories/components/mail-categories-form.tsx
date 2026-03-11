import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserMailCategory,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-api-types'
import type React from 'react'
import { lazy } from 'react'

// Import types

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserMailCategory) => void
}

// Lazy load the address books form component
const LazyMailCategoriesFormCore = lazy(
  () => import('./mail-categories-form-core')
)

const LazyMailCategoriesForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyMailCategoriesFormCore {...props} />
  </LazyWrapper>
)

export { LazyMailCategoriesForm as MailCategoriesSettingsForm }
export default LazyMailCategoriesForm
