import { FormLoader, LazyWrapper } from '@/components/lazy-components'
import {
  UserGeneral,
  UserPreferences,
} from '@/features/user-settings/store/user-preferences-types'
import type React from 'react'
import { lazy } from 'react'

interface Props {
  data: UserPreferences | undefined
  update: (_data: UserGeneral) => void
}

// Lazy load the general form component
const LazyGeneralFormCore = lazy(() => import('./general-form-core'))

const LazyGeneralForm: React.FC<Props> = (props) => (
  <LazyWrapper fallback={<FormLoader />}>
    <LazyGeneralFormCore {...props} />
  </LazyWrapper>
)

export { LazyGeneralForm as GeneralSettingsForm }
export default LazyGeneralForm
